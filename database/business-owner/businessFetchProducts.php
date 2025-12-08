<?php
header('Content-Type: application/json');

// DB connection
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "louver";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'products' => []]);
    exit;
}

$vendor_id = 1; // Logged-in vendor ID

// Fetch products
$query = "SELECT * FROM products WHERE vendor_id = '$vendor_id' ORDER BY product_id DESC";
$result = $conn->query($query);

$products = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode([
    'success' => true,
    'products' => $products
]);

$conn->close();
?>