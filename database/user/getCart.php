<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';
session_start();

$customer_id = isset($_SESSION['customer_id']) ? intval($_SESSION['customer_id']) : null;
if (!$customer_id) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT ci.cart_id, ci.product_id, ci.quantity,
               p.NAME, p.price, p.image, p.vendor_id,
               v.business_name
        FROM cart_items ci
        JOIN products p ON p.product_id = ci.product_id
        JOIN vendors v ON v.vendor_id = p.vendor_id
        WHERE ci.customer_id = ?
        ORDER BY v.business_name, p.NAME";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $customer_id);
$stmt->execute();
$res = $stmt->get_result();
$items = $res->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();

echo json_encode($items);

