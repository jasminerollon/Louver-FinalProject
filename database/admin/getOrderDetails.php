<?php
session_start();
header('Content-Type: application/json');
require_once '../../database/connectDB.php';

function respond($code, $payload) {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

$orderId = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;
if ($orderId <= 0) {
  respond(400, ['status' => 'error', 'message' => 'Invalid order_id']);
}

try {
  // Order, customer, vendor
  $sql = "SELECT 
            o.order_id, o.created_at, o.total_price, o.order_status, o.delivery_fee,
            o.customer_note, o.delivery_address,
            c.customer_id, c.NAME AS customer_name, c.contact_number AS customer_contact, c.email AS customer_email, c.profile_image AS customer_image,
            v.vendor_id, v.business_name, v.contact_number AS vendor_contact, v.email AS vendor_email, v.profile_image AS vendor_image
          FROM orders o
          LEFT JOIN customers c ON c.customer_id = o.customer_id
          LEFT JOIN vendors v ON v.vendor_id = o.vendor_id
          WHERE o.order_id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('i', $orderId);
  $stmt->execute();
  $orderRes = $stmt->get_result();
  if ($orderRes->num_rows === 0) {
    respond(404, ['status' => 'error', 'message' => 'Order not found']);
  }
  $o = $orderRes->fetch_assoc();

  // Items
  $itemsSql = "SELECT oi.order_item_id, oi.product_id, oi.product_name, oi.price_at_time, oi.quantity
               FROM order_items oi
               WHERE oi.order_id = ?";
  $stmt2 = $conn->prepare($itemsSql);
  $stmt2->bind_param('i', $orderId);
  $stmt2->execute();
  $itemsRes = $stmt2->get_result();
  $items = [];
  while ($row = $itemsRes->fetch_assoc()) {
    $items[] = [
      'order_item_id' => (int)$row['order_item_id'],
      'product_id' => (int)$row['product_id'],
      'name' => $row['product_name'],
      'price' => (float)$row['price_at_time'],
      'quantity' => (int)$row['quantity']
    ];
  }

  // Build payload
  $payload = [
    'status' => 'success',
    'data' => [
      'order' => [
        'order_id' => (int)$o['order_id'],
        'created_at' => $o['created_at'],
        'total_price' => (float)$o['total_price'],
        'order_status' => $o['order_status'],
        'delivery_fee' => isset($o['delivery_fee']) ? (float)$o['delivery_fee'] : null,
        'customer_note' => $o['customer_note'],
        'delivery_address' => $o['delivery_address']
      ],
      'customer' => [
        'customer_id' => (int)$o['customer_id'],
        'name' => $o['customer_name'],
        'contact' => $o['customer_contact'],
        'email' => $o['customer_email'],
        'image' => $o['customer_image'] ?: 'default.png'
      ],
      'vendor' => [
        'vendor_id' => (int)$o['vendor_id'],
        'name' => $o['business_name'],
        'contact' => $o['vendor_contact'],
        'email' => $o['vendor_email'],
        'image' => $o['vendor_image'] ?: 'default.png'
      ],
      'items' => $items
    ]
  ];

  respond(200, $payload);

} catch (Exception $e) {
  respond(500, ['status' => 'error', 'message' => $e->getMessage()]);
}
