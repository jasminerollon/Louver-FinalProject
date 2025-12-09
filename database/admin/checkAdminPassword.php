<?php
header('Content-Type: application/json');
session_start();

// Ensure admin is authenticated
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
$candidate = $_POST['candidate_password'] ?? '';

if ($candidate === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing candidate password']);
    exit;
}

// Fetch stored password (hash or plain depending on existing schema)
$sql = 'SELECT password_hash FROM admins WHERE admin_id = ? LIMIT 1';
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Query prepare failed']);
    exit;
}

$stmt->bind_param('i', $admin_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Admin not found']);
    $stmt->close();
    $conn->close();
    exit;
}

$row = $result->fetch_assoc();
$stored = (string) ($row['password_hash'] ?? '');

// If stored looks like a password hash, verify; else compare directly
$isHash = preg_match('/^\$2y\$|^\$argon2|^\$2a\$|^\$2b\$|^\$pbkdf2/i', $stored) === 1;

$same = false;
if ($isHash) {
    $same = password_verify($candidate, $stored);
} else {
    $same = hash_equals($stored, $candidate);
}

http_response_code(200);
echo json_encode(['status' => 'success', 'same' => $same]);

$stmt->close();
$conn->close();
