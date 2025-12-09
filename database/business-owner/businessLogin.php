<?php
session_start();

// DB connection
$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get POST data from login form
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
if ($email === '' || $password === '') {
    header("Location: ../../html/business-owner/business-owner-login.html?error=1");
    exit;
}

// Attempt to find vendor directly (approved vendors only exist in vendors table)
$vendor = null;
$stmt = $conn->prepare("SELECT vendor_id, business_name, password_hash, session_status FROM vendors WHERE email = ? LIMIT 1");
if ($stmt) {
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res && $res->num_rows === 1) {
        $vendor = $res->fetch_assoc();
    }
    $stmt->close();
}

// If not found, try approved application linked to a vendor
if (!$vendor) {
    $a = $conn->prepare("SELECT vendor_id FROM applications WHERE email = ? AND status = 'Approved' AND vendor_id IS NOT NULL LIMIT 1");
    if ($a) {
        $a->bind_param("s", $email);
        $a->execute();
        $ar = $a->get_result();
        if ($ar && $ar->num_rows === 1) {
            $vid = (int)$ar->fetch_assoc()['vendor_id'];
            $a->close();
            $b = $conn->prepare("SELECT vendor_id, business_name, password_hash, session_status FROM vendors WHERE vendor_id = ? LIMIT 1");
            if ($b) {
                $b->bind_param("i", $vid);
                $b->execute();
                $br = $b->get_result();
                if ($br && $br->num_rows === 1) {
                    $vendor = $br->fetch_assoc();
                }
                $b->close();
            }
        } else {
            $a->close();
        }
    }
}

if (!$vendor) {
    header("Location: ../../html/business-owner/business-owner-login.html?error=1");
    exit;
}

// Compare password using hash; allow legacy plain and temp fallback
$valid = false;
if (!empty($vendor['password_hash'])) {
    if (password_verify($password, $vendor['password_hash'])) { $valid = true; }
    else if (hash_equals($vendor['password_hash'], $password)) { $valid = true; }
}

if ($valid) {
    $_SESSION['vendor_id'] = $vendor['vendor_id'];
    $_SESSION['vendor_name'] = $vendor['business_name'];

    // Mark vendor as Online
    $upd = $conn->prepare("UPDATE vendors SET session_status='Online' WHERE vendor_id = ?");
    if ($upd) {
        $upd->bind_param("i", $vendor['vendor_id']);
        $upd->execute();
        $upd->close();
    }

    // Route based on application status
    $status = 'Approved';
    $app = $conn->prepare("SELECT status FROM applications WHERE vendor_id = ? ORDER BY reviewed_at DESC, submitted_at DESC LIMIT 1");
    if ($app) {
        $app->bind_param("i", $vendor['vendor_id']);
        $app->execute();
        $appRes = $app->get_result();
        if ($appRes && $appRes->num_rows === 1) {
            $row = $appRes->fetch_assoc();
            $status = $row['status'] ?? 'Approved';
        }
        $app->close();
    }

    if ($status === 'Approved') {
        header("Location: ../../html/business-owner/business-owner-products.html");
    } else {
        header("Location: ../../database/business-owner/business-owner-status.php");
    }
    exit;
} else {
    // Fallback: approved application with matching temp_password
    $fa = $conn->prepare("SELECT vendor_id FROM applications WHERE email = ? AND status='Approved' AND temp_password = ? ORDER BY reviewed_at DESC LIMIT 1");
    if ($fa) {
        $fa->bind_param("ss", $email, $password);
        $fa->execute();
        $far = $fa->get_result();
        if ($far && $far->num_rows === 1) {
            $_SESSION['vendor_id'] = $vendor ? $vendor['vendor_id'] : (int)$far->fetch_assoc()['vendor_id'];
            // Fetch vendor name for session
            if (!$vendor) {
                $vid = $_SESSION['vendor_id'];
                $b = $conn->prepare("SELECT business_name FROM vendors WHERE vendor_id = ? LIMIT 1");
                if ($b) { $b->bind_param("i", $vid); $b->execute(); $br = $b->get_result(); if ($br && $br->num_rows === 1) { $_SESSION['vendor_name'] = $br->fetch_assoc()['business_name']; } $b->close(); }
            } else {
                $_SESSION['vendor_name'] = $vendor['business_name'];
            }

            $upd = $conn->prepare("UPDATE vendors SET session_status='Online' WHERE vendor_id = ?");
            if ($upd) { $upd->bind_param("i", $_SESSION['vendor_id']); $upd->execute(); $upd->close(); }
            header("Location: ../../html/business-owner/business-owner-products.html");
            exit;
        }
        $fa->close();
    }

    header("Location: ../../html/business-owner/business-owner-login.html?error=1");
    exit;
}
?>