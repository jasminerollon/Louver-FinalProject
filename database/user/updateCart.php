<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';
session_start();

$customer_id = isset($_SESSION['customer_id']) ? intval($_SESSION['customer_id']) : null;
$product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
$quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 0;

if (!$customer_id) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if (!$product_id) {
    echo json_encode(['success' => false, 'message' => 'Invalid product']);
    exit;
}

if ($quantity <= 0) {
    $del = $conn->prepare("DELETE FROM cart_items WHERE customer_id = ? AND product_id = ?");
    $del->bind_param("ii", $customer_id, $product_id);
    $ok = $del->execute();
    $del->close();
} else {
    $upd = $conn->prepare("UPDATE cart_items SET quantity = ? WHERE customer_id = ? AND product_id = ?");
    $upd->bind_param("iii", $quantity, $customer_id, $product_id);
    $ok = $upd->execute();
    $upd->close();
}

// cart count
$cntStmt = $conn->prepare("SELECT COALESCE(SUM(quantity),0) AS cnt FROM cart_items WHERE customer_id = ?");
$cntStmt->bind_param("i", $customer_id);
$cntStmt->execute();
$cntRes = $cntStmt->get_result()->fetch_assoc();
$cntStmt->close();
$conn->close();

if ($ok) {
    echo json_encode(['success' => true, 'cart_count' => (int)($cntRes['cnt'] ?? 0)]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update cart']);
}

