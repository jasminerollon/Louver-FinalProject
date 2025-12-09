<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';
session_start();

$customer_id = isset($_SESSION['customer_id']) ? intval($_SESSION['customer_id']) : null;
if (!$customer_id) {
    echo json_encode(['count' => 0]);
    exit;
}

$stmt = $conn->prepare("SELECT COALESCE(SUM(quantity),0) AS cnt FROM cart_items WHERE customer_id = ?");
$stmt->bind_param("i", $customer_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

echo json_encode(['count' => (int)($res['cnt'] ?? 0)]);

