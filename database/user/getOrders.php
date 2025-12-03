<?php
header('Content-Type: application/json');
require_once '../connectDB.php';

session_start();
$customer_id = isset($_SESSION['customer_id']) ? $_SESSION['customer_id'] : 101;

$sql = "SELECT o.*, v.business_name, v.profile_image
        FROM orders o
        JOIN vendors v ON o.vendor_id = v.vendor_id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $customer_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = [
        'order_id' => $row['order_id'],
        'vendor_name' => $row['business_name'],
        'vendor_image' => $row['profile_image'] ? $row['profile_image'] : 'default.png',
        'total_price' => number_format($row['total_price'], 2),
        'status' => $row['order_status'],
        'rejection_reason' => $row['rejection_reason'],
        'created_at' => $row['created_at']
    ];
}

echo json_encode($orders);
$stmt->close();
$conn->close();
