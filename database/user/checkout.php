<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';
session_start();

$customer_id = isset($_SESSION['customer_id']) ? intval($_SESSION['customer_id']) : 2;
$address = isset($_POST['delivery_address']) ? trim($_POST['delivery_address']) : '';
$note = isset($_POST['note']) ? trim($_POST['note']) : '';
$delivery_fee = 20.00;

if (!$customer_id) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// Load cart
$sql = "SELECT ci.product_id, ci.quantity, p.price, p.vendor_id, p.NAME
        FROM cart_items ci
        JOIN products p ON p.product_id = ci.product_id
        WHERE ci.customer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $customer_id);
$stmt->execute();
$res = $stmt->get_result();
$items = $res->fetch_all(MYSQLI_ASSOC);
$stmt->close();

if (!$items) {
    echo json_encode(['success' => false, 'message' => 'Cart is empty']);
    $conn->close();
    exit;
}

// Enforce single vendor
$vendor_id = $items[0]['vendor_id'];
foreach ($items as $it) {
    if ((int)$it['vendor_id'] !== (int)$vendor_id) {
        echo json_encode(['success' => false, 'message' => 'Multiple restaurants in cart. Please keep items from one restaurant.']);
        $conn->close();
        exit;
    }
}

// Compute totals
$subtotal = 0;
foreach ($items as $it) {
    $subtotal += ((float)$it['price']) * ((int)$it['quantity']);
}
$total = $subtotal + $delivery_fee;

// Insert order
$insOrder = $conn->prepare("
    INSERT INTO orders (customer_id, vendor_id, total_price, payment_method, order_status, delivery_address, customer_note, delivery_fee)
    VALUES (?, ?, ?, 'COD', 'Preparing', ?, ?, ?)
");
$insOrder->bind_param("iidssd", $customer_id, $vendor_id, $total, $address, $note, $delivery_fee);
$okOrder = $insOrder->execute();
$order_id = $insOrder->insert_id;
$insOrder->close();

if (!$okOrder) {
    echo json_encode(['success' => false, 'message' => 'Failed to place order']);
    $conn->close();
    exit;
}

// Insert order_items
$insItem = $conn->prepare("
    INSERT INTO order_items (order_id, product_id, product_name, price_at_time, quantity)
    VALUES (?, ?, ?, ?, ?)
");
foreach ($items as $it) {
    $pname = $it['NAME'];
    $price = (float)$it['price'];
    $qty = (int)$it['quantity'];
    $insItem->bind_param("iisdi", $order_id, $it['product_id'], $pname, $price, $qty);
    $insItem->execute();
}
$insItem->close();

// Clear cart
$clr = $conn->prepare("DELETE FROM cart_items WHERE customer_id = ?");
$clr->bind_param("i", $customer_id);
$clr->execute();
$clr->close();

$conn->close();

echo json_encode(['success' => true, 'order_id' => $order_id, 'total' => $total]);

