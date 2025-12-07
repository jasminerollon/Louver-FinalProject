<?php
session_start();

if (!isset($_SESSION['vendor_id'])) {
    echo json_encode(["error" => "unauthorized"]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) {
    echo json_encode(["error" => "db_error"]);
    exit();
}

$vendor_id = $_SESSION['vendor_id'];

$stmt = $conn->prepare("
    SELECT vendor_id, business_name, owner_name, contact_number, address, email,
           business_permit, profile_image
    FROM vendors 
    WHERE vendor_id = ?
");
$stmt->bind_param("i", $vendor_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["error" => "not_found"]);
    exit();
}

$vendor = $result->fetch_assoc();

echo json_encode($vendor);
?>
