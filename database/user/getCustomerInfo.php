<?php
session_start();
header('Content-Type: application/json');

require_once '../connectDB.php';

// Fetch customer info from DB
$customer_id = $_SESSION['customer_id'];

$stmt = $conn->prepare("SELECT NAME, email, contact_number, profile_image FROM customers WHERE customer_id = ?");
$stmt->bind_param("i", $customer_id);
$stmt->execute();
$stmt->bind_result($customer_name, $customer_email, $customer_contact, $profile_image);
$stmt->fetch();

if (empty($profile_image) || $profile_image === "default.png") {
    $image_path = "../../assets/pictures/default.png";
} else {
    $image_path = "../../assets/uploads/profile_images/" . $profile_image;
}

echo json_encode([
    'status' => 'success',
    'customer_name' => $customer_name,
    'customer_email' => $customer_email,
    'customer_contact' => $customer_contact,
    'profile_image' => $image_path
]);

$stmt->close();
$conn->close();
?>
