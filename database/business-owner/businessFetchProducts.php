<?php
header('Content-Type: application/json');
session_start();

// DB connection
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "louver";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed", "products" => []]);
    exit;
}

// Require logged-in vendor
if (!isset($_SESSION['vendor_id'])) {
    echo json_encode(["success" => false, "message" => "Vendor not logged in", "products" => []]);
    $conn->close();
    exit;
}

$vendor_id = (int) $_SESSION['vendor_id'];

// Fetch products for this vendor
$stmt = $conn->prepare("SELECT product_id, vendor_id, NAME, image, description, price FROM products WHERE vendor_id = ? ORDER BY product_id DESC");
$stmt->bind_param("i", $vendor_id);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode([
    "success" => true,
    "products" => $products
]);

$stmt->close();
$conn->close();
?>