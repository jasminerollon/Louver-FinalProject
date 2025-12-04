<?php
header('Content-Type: application/json');
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Not authenticated. Please login first.'
    ]);
    exit;
}

// Load DB connection
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

$admin_id = $_SESSION['admin_id'];

// Query admin information
$query = "SELECT admin_id, username, name, email, mobile_number FROM admins WHERE admin_id = ?";
$stmt = $conn->prepare($query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database query failed: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $admin_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Admin not found'
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$admin = $result->fetch_assoc();
$stmt->close();

// Return admin data
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'data' => [
        'admin_id' => $admin['admin_id'],
        'name' => ($admin['name'] ?? null) ? $admin['name'] : $admin['username'],
        'email' => $admin['email'] ?? 'N/A',
        'mobile_number' => $admin['mobile_number'] ?? 'N/A',
        'username' => $admin['username']
    ]
]);

$conn->close();
?>
