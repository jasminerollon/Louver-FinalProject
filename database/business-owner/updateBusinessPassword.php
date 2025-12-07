<?php
session_start();
require_once "../connectDB.php"; // adjust path

header('Content-Type: application/json');

if (!isset($_SESSION['vendor_id'])) { // <-- use vendor_id, not business_id
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

$vendor_id = $_SESSION['vendor_id']; // <-- make sure session stores vendor_id
$new_password = $_POST['new_password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

if ($new_password !== $confirm_password) {
    echo json_encode(["success" => false, "message" => "Passwords do not match"]);
    exit();
}

if (strlen($new_password) < 6) {
    echo json_encode(["success" => false, "message" => "Password must be at least 6 characters"]);
    exit();
}

// Hash the password
$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

// Update the password in the database
$stmt = $conn->prepare("UPDATE vendors SET password_hash=? WHERE vendor_id=?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare statement failed: ".$conn->error]);
    exit();
}
$stmt->bind_param("si", $hashed_password, $vendor_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Password updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update password: ".$stmt->error]);
}
