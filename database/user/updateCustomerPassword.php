<?php
session_start();
header('Content-Type: application/json');
ob_clean(); // Clean any output buffer

require '../connectDB.php';

// Check if user is logged in
if (!isset($_SESSION['customer_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$customer_id = $_SESSION['customer_id'];
$new_password = $_POST['new_password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// Basic validation
if (empty($new_password) || empty($confirm_password)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

if ($new_password !== $confirm_password) {
    echo json_encode(['status' => 'error', 'message' => 'Passwords do not match']);
    exit;
}

// Validate password length
if (strlen($new_password) < 6) {
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters long']);
    exit;
}

// Hash the password for security
$password_hash = password_hash($new_password, PASSWORD_DEFAULT);

// Update in database
$stmt = $conn->prepare("UPDATE customers SET password_hash = ? WHERE customer_id = ?");
$stmt->bind_param("si", $password_hash, $customer_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        $response = ['status' => 'success', 'message' => 'Password updated successfully'];
    } else {
        $response = ['status' => 'error', 'message' => 'No changes made or password is the same'];
    }
} else {
    $response = ['status' => 'error', 'message' => 'Update failed: ' . $stmt->error];
}

$stmt->close();
$conn->close();

// Send clean JSON response
echo json_encode($response);
exit;
?>
