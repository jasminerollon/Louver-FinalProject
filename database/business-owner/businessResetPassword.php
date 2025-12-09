<?php
header('Content-Type: application/json');
session_start();

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "louver";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Get POST data
$email = $_POST['email'] ?? '';
$new_password = $_POST['new_password'] ?? '';

if (!$email || !$new_password) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

// Check if vendor exists
$stmt = $conn->prepare("SELECT vendor_id FROM vendors WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

$vendor = $result->fetch_assoc();
$vendor_id = $vendor['vendor_id'];

// Update password in plain text
$update = $conn->prepare("UPDATE vendors SET password_hash=? WHERE vendor_id=?");
$update->bind_param("si", $new_password, $vendor_id);

if ($update->execute()) {
    echo json_encode(["success" => true, "message" => "Password reset successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to reset password"]);
}
exit;
?>