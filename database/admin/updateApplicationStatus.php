<?php
session_start();
header('Content-Type: application/json');

require_once '../../database/connectDB.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['application_id']) || !isset($input['status'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
    exit;
}

$application_id = trim($input['application_id']);
$status = trim($input['status']);
$rejection_reason = isset($input['rejection_reason']) ? trim($input['rejection_reason']) : null;

try {
    // Special handling: when approving, also populate vendors and link vendor_id
    if (strcasecmp($status, 'Approved') === 0) {
        // Start transaction for atomicity
        if (method_exists($conn, 'begin_transaction')) { $conn->begin_transaction(); } else { $conn->autocommit(false); }

        // Fetch full application info
        $appStmt = $conn->prepare("SELECT application_id, registration_no, vendor_id, business_name, owner_name, contact_number, address, email, temp_password, business_permit, description, status FROM applications WHERE application_id = ?");
        if (!$appStmt) { throw new Exception('Prepare application fetch failed: ' . $conn->error); }
        $appStmt->bind_param('s', $application_id);
        $appStmt->execute();
        $appRes = $appStmt->get_result();
        if (!$appRes || $appRes->num_rows === 0) { throw new Exception('Application not found'); }
        $app = $appRes->fetch_assoc();
        $appStmt->close();

        // If already has vendor_id, just mark approved with reviewed_at
        $new_vendor_id = isset($app['vendor_id']) ? (int)$app['vendor_id'] : 0;

        if (!$new_vendor_id) {
            // Check for existing vendor by email or business_name
            $new_vendor_id = 0;
            $checkEmail = $conn->prepare("SELECT vendor_id FROM vendors WHERE email = ?");
            if ($checkEmail) {
                $checkEmail->bind_param('s', $app['email']);
                $checkEmail->execute();
                $emailRes = $checkEmail->get_result();
                if ($emailRes && $emailRes->num_rows === 1) { $new_vendor_id = (int)$emailRes->fetch_assoc()['vendor_id']; }
                $checkEmail->close();
            }

            if (!$new_vendor_id) {
                $checkName = $conn->prepare("SELECT vendor_id FROM vendors WHERE business_name = ?");
                if ($checkName) {
                    $checkName->bind_param('s', $app['business_name']);
                    $checkName->execute();
                    $nameRes = $checkName->get_result();
                    if ($nameRes && $nameRes->num_rows === 1) { $new_vendor_id = (int)$nameRes->fetch_assoc()['vendor_id']; }
                    $checkName->close();
                }
            }

            if ($new_vendor_id) {
                // Update vendor details with latest application info
                $desc = isset($app['description']) ? $app['description'] : '';
                // If application carries a temp password, set/refresh vendor password
                $ph = null;
                if (!empty($app['temp_password'])) { $ph = password_hash($app['temp_password'], PASSWORD_DEFAULT); }
                $upd = $conn->prepare("UPDATE vendors SET business_name=?, owner_name=?, contact_number=?, address=?, description=?, business_permit=?, password_hash = COALESCE(?, password_hash) WHERE vendor_id = ?");
                if (!$upd) { throw new Exception('Prepare vendor update failed: ' . $conn->error); }
                $upd->bind_param('sssssssi', $app['business_name'], $app['owner_name'], $app['contact_number'], $app['address'], $desc, $app['business_permit'], $ph, $new_vendor_id);
                if (!$upd->execute()) { throw new Exception('Failed to update vendor: ' . $upd->error); }
                $upd->close();
            } else {
                // Insert new vendor from application
                $password_hash = null;
                if (!empty($app['temp_password'])) { $password_hash = password_hash($app['temp_password'], PASSWORD_DEFAULT); }
                $desc = isset($app['description']) ? $app['description'] : '';

                $ins = $conn->prepare("INSERT INTO vendors (business_name, owner_name, contact_number, address, email, description, estimated_time, business_permit, profile_image, password_hash, session_status, banner_image, created_at) VALUES (?, ?, ?, ?, ?, ?, '10 mins', ?, 'default.png', ?, 'Offline', 'banner_default.jpg', NOW())");
                if (!$ins) { throw new Exception('Prepare vendor insert failed: ' . $conn->error); }
                $ins->bind_param('ssssssss', $app['business_name'], $app['owner_name'], $app['contact_number'], $app['address'], $app['email'], $desc, $app['business_permit'], $password_hash);
                if (!$ins->execute()) { throw new Exception('Failed to create vendor: ' . $ins->error); }
                $new_vendor_id = $ins->insert_id;
                $ins->close();

                if (!$new_vendor_id || $new_vendor_id === 0) {
                    // Fallback: reselect by email
                    $fb = $conn->prepare("SELECT vendor_id FROM vendors WHERE email = ? LIMIT 1");
                    if (!$fb) { throw new Exception('Prepare vendor fallback failed: ' . $conn->error); }
                    $fb->bind_param('s', $app['email']);
                    $fb->execute();
                    $fr = $fb->get_result();
                    if ($fr && $fr->num_rows === 1) { $new_vendor_id = (int)$fr->fetch_assoc()['vendor_id']; }
                    $fb->close();
                    if (!$new_vendor_id) { throw new Exception('Vendor creation failed; no vendor_id found'); }
                }
            }
        }

        // Finally, mark application Approved and link vendor_id + reviewed_at
        $upApp = $conn->prepare("UPDATE applications SET status='Approved', vendor_id=?, rejection_reason=NULL, reviewed_at=CURRENT_TIMESTAMP WHERE application_id=?");
        if (!$upApp) { throw new Exception('Prepare application update failed: ' . $conn->error); }
        $upApp->bind_param('is', $new_vendor_id, $application_id);
        if (!$upApp->execute()) { throw new Exception('Failed to update application: ' . $upApp->error); }
        $upApp->close();

        // Commit
        $conn->commit();

        echo json_encode(['status' => 'success', 'vendor_id' => $new_vendor_id]);
    } else if (strcasecmp($status, 'Rejected') === 0) {
        $query = "UPDATE applications SET status = ?, rejection_reason = ? WHERE application_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sss", $status, $rejection_reason, $application_id);
        if (!$stmt->execute()) { throw new Exception($stmt->error); }
        echo json_encode(['status' => 'success']);
        $stmt->close();
    } else {
        $query = "UPDATE applications SET status = ?, rejection_reason = NULL WHERE application_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $status, $application_id);
        if (!$stmt->execute()) { throw new Exception($stmt->error); }
        echo json_encode(['status' => 'success']);
        $stmt->close();
    }

} catch (Exception $e) {
    if ($conn && method_exists($conn, 'rollback')) { $conn->rollback(); }
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
