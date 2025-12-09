<?php
header('Content-Type: application/json');
require_once '../connectDB.php';

// Get raw JSON input
$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$new_password = trim($data['new_password'] ?? '');
$confirm_password = trim($data['confirm_password'] ?? '');

if (!$email || !$new_password || !$confirm_password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

if ($new_password !== $confirm_password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Passwords do not match']);
    exit;
}

if (strlen($new_password) < 6) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters']);
    exit;
}

// Find admin by email
$stmt = $conn->prepare("SELECT admin_id, password_hash FROM admins WHERE email = ? LIMIT 1");
$stmt->bind_param('s', $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Admin not found']);
    exit;
}

$row = $res->fetch_assoc();
$admin_id = $row['admin_id'];
$stored_hash = $row['password_hash'];

// Prevent using the same password
if (password_verify($new_password, $stored_hash)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'New password cannot be the same as the old one']);
    exit;
}

// Update password (store plain text)
$update = $conn->prepare("UPDATE admins SET password_hash = ? WHERE admin_id = ?");
$update->bind_param('si', $new_password, $admin_id); // <- store as-is

if ($update->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Password updated successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to update password']);
}


$update->close();
$conn->close();
