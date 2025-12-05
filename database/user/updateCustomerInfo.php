<?php
session_start();
require_once '../connectDB.php';

$customer_id = $_SESSION['customer_id'];

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';

$stmt = $conn->prepare("UPDATE customers SET NAME=?, email=?, contact_number=? WHERE customer_id=?");
$stmt->bind_param("sssi", $name, $email, $phone, $customer_id);

if ($stmt->execute()) {
    echo json_encode(['status'=>'success', 'message'=>'Account info updated successfully']);
} else {
    echo json_encode(['status'=>'error', 'message'=>'Failed to update account info']);
}

$stmt->close();
$conn->close();
?>
