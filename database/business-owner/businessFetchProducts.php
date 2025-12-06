<?php
header('Content-Type: application/json');

// Database connection
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "louver";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success'=>false,'products'=>[]]);
    exit;
}

// Replace with the logged-in vendor ID
$vendor_id = 1;

$sql = "SELECT * FROM products WHERE vendor_id = '$vendor_id' ORDER BY product_id DESC";
$result = $conn->query($sql);

$products = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

// Return success and products
echo json_encode(['success'=>true, 'products'=>$products]);
$conn->close();
?>
