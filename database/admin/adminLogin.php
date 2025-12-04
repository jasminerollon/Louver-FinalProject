<?php
header('Content-Type: application/json');
session_start();

// 1. Load DB connection FIRST
require_once '../connectDB.php';

// If DB connection failed, stop early
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

// 2. Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Username and password are required'
    ]);
    exit;
}

$username = trim($input['username']);
$password = trim($input['password']);

// 3. Query admin user
$query = "SELECT admin_id, username, password_hash FROM admins WHERE username = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid username or password'
    ]);
    exit;
}

$admin = $result->fetch_assoc();
$stmt->close();

// 4. PASSWORD CHECK
if ($password === $admin['password_hash']) {

    $_SESSION['admin_id'] = $admin['admin_id'];
    $_SESSION['username'] = $admin['username'];
    $_SESSION['login_time'] = time();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'redirect' => '../../html/admin/admin-homepage.html'
    ]);
    exit;

} else {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid username or password'
    ]);
    exit;
}

$conn->close();
?>