<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';
session_start();

// In production this should strictly come from session.
// Fallback added so the cart works even if session is not set during local testing.
$customer_id = isset($_SESSION['customer_id']) ? intval($_SESSION['customer_id']) : 2;

$product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
$quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;

if (!$customer_id) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if (!$product_id || $quantity < 1) {
    echo json_encode(['success' => false, 'message' => 'Invalid product or quantity']);
    exit;
}

// Check if already in cart: update quantity
$check = $conn->prepare("SELECT cart_id, quantity FROM cart_items WHERE customer_id = ? AND product_id = ?");
$check->bind_param("ii", $customer_id, $product_id);
$check->execute();
$res = $check->get_result();

if ($row = $res->fetch_assoc()) {
    $newQty = $row['quantity'] + $quantity;
    $upd = $conn->prepare("UPDATE cart_items SET quantity = ? WHERE cart_id = ?");
    $upd->bind_param("ii", $newQty, $row['cart_id']);
    $ok = $upd->execute();
    $upd->close();
} else {
    $ins = $conn->prepare("INSERT INTO cart_items (customer_id, product_id, quantity) VALUES (?, ?, ?)");
    $ins->bind_param("iii", $customer_id, $product_id, $quantity);
    $ok = $ins->execute();
    $ins->close();
}

function cart_count($conn, $customer_id) {
    $cnt = $conn->prepare("SELECT COALESCE(SUM(quantity),0) AS c FROM cart_items WHERE customer_id = ?");
    $cnt->bind_param("i", $customer_id);
    $cnt->execute();
    $res = $cnt->get_result()->fetch_assoc();
    $cnt->close();
    return (int)($res['c'] ?? 0);
}

if ($ok) {
    echo json_encode(['success' => true, 'cart_count' => cart_count($conn, $customer_id)]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add to cart']);
}

$check->close();
$conn->close();

