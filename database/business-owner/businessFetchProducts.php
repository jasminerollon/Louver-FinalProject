<?php
header('Content-Type: application/json');

// Database connection
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "louver";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'orders' => [], 'refunds' => []]);
    exit;
}

// Replace with the logged-in vendor ID
$vendor_id = 1;

// Fetch orders (non-refund)
$sqlOrders = "SELECT * FROM orders WHERE vendor_id = '$vendor_id' AND is_refund = 0 ORDER BY order_id DESC";
$resultOrders = $conn->query($sqlOrders);

$orders = [];
if ($resultOrders->num_rows > 0) {
    while ($row = $resultOrders->fetch_assoc()) {
        $orders[] = $row;
    }
}

// Fetch refunds
$sqlRefunds = "SELECT * FROM orders WHERE vendor_id = '$vendor_id' AND is_refund = 1 ORDER BY order_id DESC";
$resultRefunds = $conn->query($sqlRefunds);

$refunds = [];
if ($resultRefunds->num_rows > 0) {
    while ($row = $resultRefunds->fetch_assoc()) {
        $refunds[] = $row;
    }
}

// Return data
echo json_encode(['success' => true, 'orders' => $orders, 'refunds' => $refunds]);

$conn->close();
?>
