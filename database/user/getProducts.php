<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';

$vendor_id = isset($_GET['rid']) ? intval($_GET['rid']) : 0;

if (!$vendor_id) {
    echo json_encode([]);
    exit;
}

$stmt = $conn->prepare("SELECT product_id, vendor_id, NAME, category, image, description, price FROM products WHERE vendor_id = ? ORDER BY NAME ASC");
$stmt->bind_param("i", $vendor_id);
$stmt->execute();
$result = $stmt->get_result();
$products = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($products);

$stmt->close();
$conn->close();

