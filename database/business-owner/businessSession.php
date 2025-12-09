<?php
session_start();

// Check if logged in
if (!isset($_SESSION['vendor_id'])) {
    header("Location: ../../html/business-owner/business-owner-login.html");
    exit();
}

// DB connection
$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch vendor data
$vendor_id = $_SESSION['vendor_id'];
$stmt = $conn->prepare("SELECT * FROM vendors WHERE vendor_id = ?");
$stmt->bind_param("i", $vendor_id);
$stmt->execute();
$result = $stmt->get_result();
$vendor = $result->fetch_assoc();

// Assign variables for status page
$status = 'Approved';
$rejection_reason = null;
$app = null;
// Try to fetch application status from applications table for history/display
$appStmt = $conn->prepare("SELECT status, rejection_reason FROM applications WHERE vendor_id = ? ORDER BY reviewed_at DESC, submitted_at DESC LIMIT 1");
if ($appStmt) {
    $appStmt->bind_param("i", $vendor_id);
    $appStmt->execute();
    $appRes = $appStmt->get_result();
    if ($appRes && $appRes->num_rows > 0) {
        $app = $appRes->fetch_assoc();
        $status = $app['status'];
        $rejection_reason = $app['rejection_reason'];
    }
    $appStmt->close();
}
$email = $vendor['email'];
$password = $vendor['password_hash']; // hashed password
?>
