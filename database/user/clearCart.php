<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';
session_start();

$customer_id = isset($_SESSION['customer_id']) ? intval($_SESSION['customer_id']) : 2;
if (!$customer_id) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM cart_items WHERE customer_id = ?");
$stmt->bind_param("i", $customer_id);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

echo json_encode(['success' => (bool)$ok]);

