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
  echo json_encode(['status' => 'error', 'message' => 'DB connection failed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
  exit;
}

$name = isset($input['name']) ? trim($input['name']) : null;
$email = isset($input['email']) ? trim($input['email']) : null;
$mobile = isset($input['mobile_number']) ? trim($input['mobile_number']) : null;
$admin_id = $_SESSION['admin_id'];

// Basic validation (optional)
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['status' => 'error', 'message' => 'Invalid email']);
  exit;
}

$query = "UPDATE admins SET name = ?, email = ?, mobile_number = ? WHERE admin_id = ?";
$stmt = $conn->prepare($query);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
  exit;
}

$stmt->bind_param('sssi', $name, $email, $mobile, $admin_id);
if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $stmt->error]);
  $stmt->close();
  $conn->close();
  exit;
}

$stmt->close();
$conn->close();

echo json_encode(['status' => 'success', 'message' => 'Profile updated']);
