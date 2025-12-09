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

// Check existing cart vendor(s)
$ok = false;
$check = $conn->prepare("SELECT ci.cart_id, ci.quantity, p.vendor_id FROM cart_items ci JOIN products p ON p.product_id = ci.product_id WHERE ci.customer_id = ?");
$check->bind_param("i", $customer_id);
$check->execute();
$res = $check->get_result();

// Enforce single-vendor cart
$existingVendor = null;
while ($row = $res->fetch_assoc()) {
    $existingVendor = $existingVendor ?? $row['vendor_id'];
    if ($existingVendor !== $row['vendor_id']) {
        // Clear check result and bail
        $check->close();
        echo json_encode(['success' => false, 'code' => 'different_vendor', 'message' => 'Cart has items from another restaurant. Clear cart to add from this one.']);
        $conn->close();
        exit;
    }
}
$check->close();

// Verify product vendor is compatible
$prodStmt = $conn->prepare("SELECT vendor_id FROM products WHERE product_id = ?");
$prodStmt->bind_param("i", $product_id);
$prodStmt->execute();
$prodRes = $prodStmt->get_result()->fetch_assoc();
$prodStmt->close();
if (!$prodRes) {
    echo json_encode(['success' => false, 'message' => 'Product not found']);
    $conn->close();
    exit;
}
if ($existingVendor && $existingVendor !== (int)$prodRes['vendor_id']) {
    echo json_encode(['success' => false, 'code' => 'different_vendor', 'message' => 'Cart has items from another restaurant. Clear cart to add from this one.']);
    $conn->close();
    exit;
}

// Check if product already in cart
$prodCheck = $conn->prepare("SELECT cart_id, quantity FROM cart_items WHERE customer_id = ? AND product_id = ?");
$prodCheck->bind_param("ii", $customer_id, $product_id);
$prodCheck->execute();
$prodRow = $prodCheck->get_result()->fetch_assoc();
$prodCheck->close();

if ($prodRow) {
    $newQty = $prodRow['quantity'] + $quantity;
    $upd = $conn->prepare("UPDATE cart_items SET quantity = ? WHERE cart_id = ?");
    $upd->bind_param("ii", $newQty, $prodRow['cart_id']);
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

