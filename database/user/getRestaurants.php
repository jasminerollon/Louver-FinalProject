<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';

$stmt = $conn->prepare("SELECT vendor_id, business_name, address, profile_image, description FROM vendors ORDER BY business_name ASC");
$stmt->execute();
$result = $stmt->get_result();
$vendors = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($vendors);

$stmt->close();
$conn->close();

