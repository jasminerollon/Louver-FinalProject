<?php
session_start();
header('Content-Type: application/json');

require_once '../../database/connectDB.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $application_id = isset($_POST['application_id']) ? trim($_POST['application_id']) : '';
    if ($application_id === '') {
        throw new Exception('Missing application_id');
    }

    // Start transaction to ensure atomicity
    if (method_exists($conn, 'begin_transaction')) {
        $conn->begin_transaction();
    } else {
        $conn->autocommit(false);
    }

    // Fetch application
    $stmt = $conn->prepare("SELECT application_id, registration_no, vendor_id, business_name, owner_name, contact_number, address, email, temp_password, business_permit, description, status FROM applications WHERE application_id = ?");
    $stmt->bind_param('s', $application_id);
    $stmt->execute();
    $res = $stmt->get_result();
    if (!$res || $res->num_rows === 0) {
        throw new Exception('Application not found');
    }
    $app = $res->fetch_assoc();
    $stmt->close();

    if (strcasecmp($app['status'], 'Pending') !== 0) {
        throw new Exception('Only pending applications can be approved');
    }

    // Create or reuse vendor (upsert with transaction locks)
    $new_vendor_id = null;

    $lockEmail = $conn->prepare("SELECT vendor_id FROM vendors WHERE email = ? FOR UPDATE");
    if ($lockEmail) {
        $lockEmail->bind_param('s', $app['email']);
        $lockEmail->execute();
        $emailRes = $lockEmail->get_result();
        if ($emailRes && $emailRes->num_rows === 1) {
            $new_vendor_id = (int)$emailRes->fetch_assoc()['vendor_id'];
        }
        $lockEmail->close();
    }

    if (!$new_vendor_id) {
        $lockName = $conn->prepare("SELECT vendor_id FROM vendors WHERE business_name = ? FOR UPDATE");
        if ($lockName) {
            $lockName->bind_param('s', $app['business_name']);
            $lockName->execute();
            $nameRes = $lockName->get_result();
            if ($nameRes && $nameRes->num_rows === 1) {
                $new_vendor_id = (int)$nameRes->fetch_assoc()['vendor_id'];
            }
            $lockName->close();
        }
    }

    if ($new_vendor_id) {
        $ph = null;
        $stmt = $conn->prepare("UPDATE vendors SET business_name=?, owner_name=?, contact_number=?, address=?, description=?, business_permit=?, password_hash = COALESCE(?, password_hash) WHERE vendor_id = ?");
        if (!$stmt) { throw new Exception('Prepare vendor update failed: ' . $conn->error); }
        $desc = isset($app['description']) ? $app['description'] : '';
        $stmt->bind_param('sssssssi', $app['business_name'], $app['owner_name'], $app['contact_number'], $app['address'], $desc, $app['business_permit'], $ph, $new_vendor_id);
        if (!$stmt->execute()) { throw new Exception('Failed to update vendor: ' . $stmt->error); }
        $stmt->close();
    } else {
        $password_hash = null;
        if (!empty($app['temp_password'])) {
            $password_hash = password_hash($app['temp_password'], PASSWORD_DEFAULT);
        }

        $stmt = $conn->prepare("INSERT INTO vendors (business_name, owner_name, contact_number, address, email, description, estimated_time, business_permit, profile_image, password_hash, session_status, banner_image, created_at) VALUES (?, ?, ?, ?, ?, ?, '10 mins', ?, 'default.png', ?, 'Offline', 'banner_default.jpg', NOW())");
        if (!$stmt) { throw new Exception('Prepare vendor insert failed: ' . $conn->error); }
        $desc = isset($app['description']) ? $app['description'] : '';
        $stmt->bind_param('ssssssss', $app['business_name'], $app['owner_name'], $app['contact_number'], $app['address'], $app['email'], $desc, $app['business_permit'], $password_hash);
        if (!$stmt->execute()) { throw new Exception('Failed to create vendor: ' . $stmt->error); }
        $new_vendor_id = $stmt->insert_id;
        if (!$new_vendor_id || $new_vendor_id === 0) {
            $fallback = $conn->prepare("SELECT vendor_id FROM vendors WHERE email = ? LIMIT 1");
            if (!$fallback) { throw new Exception('Prepare vendor fallback failed: ' . $conn->error); }
            $fallback->bind_param('s', $app['email']);
            $fallback->execute();
            $fr = $fallback->get_result();
            if ($fr && $fr->num_rows === 1) {
                $new_vendor_id = (int)$fr->fetch_assoc()['vendor_id'];
            }
            $fallback->close();
            if (!$new_vendor_id) { throw new Exception('Vendor creation failed; no vendor_id found'); }
        }
        $stmt->close();
    }

    // Update application to Approved and link vendor
    $stmt = $conn->prepare("UPDATE applications SET status='Approved', vendor_id=?, reviewed_at=CURRENT_TIMESTAMP WHERE application_id=?");
    if (!$stmt) { throw new Exception('Prepare application update failed: ' . $conn->error); }
    $stmt->bind_param('is', $new_vendor_id, $application_id);
    if (!$stmt->execute()) {
        throw new Exception('Failed to update application: ' . $stmt->error);
    }
    $stmt->close();

    // Commit transaction
    $conn->commit();

    http_response_code(200);
    echo json_encode(['status' => 'success', 'vendor_id' => $new_vendor_id]);
} catch (Exception $e) {
    if ($conn && method_exists($conn, 'rollback')) { $conn->rollback(); }
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>