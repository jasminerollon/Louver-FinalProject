<?php
session_start();
header('Content-Type: application/json');

require 'connectDB.php';

$customer_id = $_SESSION['customer_id'];
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';

// simple validation
if (empty($name) || empty($email) || empty($phone)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

// validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
    exit;
}

// check if email is taken by another customer
$stmt = $conn->prepare("SELECT customer_id FROM customers WHERE email = ? AND customer_id != ?");
$stmt->bind_param("si", $email, $customer_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Email already in use']);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

// ipdate customer info
$stmt = $conn->prepare("UPDATE customers SET NAME = ?, email = ?, contact_number = ? WHERE customer_id = ?");
$stmt->bind_param("sssi", $name, $email, $phone, $customer_id);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Account updated successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Update failed']);
}

$stmt->close();
$conn->close();
?>
