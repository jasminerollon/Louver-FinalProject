<?php
session_start();
header('Content-Type: application/json');

require '../connectDB.php';

// use session customer_id (like your other functions)
$customer_id = $_SESSION['customer_id'];
$new_password = $_POST['new_password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// basic validation
if (empty($new_password) || empty($confirm_password)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

if ($new_password !== $confirm_password) {
    echo json_encode(['status' => 'error', 'message' => 'Passwords do not match']);
    exit;
}

// hash the password (to implement soon)
// $password_hash = password_hash($new_password, PASSWORD_DEFAULT);

// for now, store plain text
$password_to_save = $new_password;

// update in database
$stmt = $conn->prepare("UPDATE customers SET password_hash = ? WHERE customer_id = ?");
$stmt->bind_param("si", $password_to_save, $customer_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        header("Location: ../../../html/user/customer-homepage.html");
        exit;
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No changes made. Please check your account.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
