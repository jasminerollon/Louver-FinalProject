<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    exit;
}

require_once '../connectDB.php';

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$admin_id = (int) $_SESSION['admin_id'];
$new_password = $_POST['new_password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

if ($new_password === '' || $confirm_password === '') {
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

// Get current password
$sql = 'SELECT password_hash FROM admins WHERE admin_id = ? LIMIT 1';
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Query prepare failed']);
    exit;
}

$stmt->bind_param('i', $admin_id);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Admin not found']);
    $stmt->close();
    $conn->close();
    exit;
}
$row = $res->fetch_assoc();
$stored = (string) ($row['password_hash'] ?? '');

$isHash = preg_match('/^\$2y\$|^\$argon2|^\$2a\$|^\$2b\$|^\$pbkdf2/i', $stored) === 1;

// Ensure new password is not the same as current
$same = false;
if ($isHash) {
    $same = password_verify($new_password, $stored);
} else {
    $same = hash_equals($stored, $new_password);
}

if ($same) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'New password cannot be the same as the current password']);
    $stmt->close();
    $conn->close();
    exit;
}

// Hash new password with secure default
$new_hash = password_hash($new_password, PASSWORD_DEFAULT);

$update = $conn->prepare('UPDATE admins SET password_hash = ? WHERE admin_id = ?');
if (!$update) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Update prepare failed']);
    $stmt->close();
    $conn->close();
    exit;
}

$update->bind_param('si', $new_hash, $admin_id);

if ($update->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Password updated successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $update->error]);
}

$update->close();
$stmt->close();
$conn->close();