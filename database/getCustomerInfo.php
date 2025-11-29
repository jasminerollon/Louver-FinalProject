<?php
session_start();
header('Content-Type: application/json');

require 'connectDB.php';

// Fetch customer info from DB
$customer_id = $_SESSION['customer_id'];

$stmt = $conn->prepare("SELECT NAME, email, contact_number FROM customers WHERE customer_id = ?");
$stmt->bind_param("i", $customer_id);
$stmt->execute();
$stmt->bind_result($customer_name, $customer_email, $customer_contact);
$stmt->fetch();

echo json_encode([
    'status' => 'success',
    'customer_name' => $customer_name,
    'customer_email' => $customer_email,
    'customer_contact' => $customer_contact
]);

$stmt->close();
$conn->close();
?>
