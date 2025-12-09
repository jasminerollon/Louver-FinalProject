<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';

function respond($code, $payload) {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

$issueId = isset($_GET['issue_id']) ? intval($_GET['issue_id']) : 0;
if ($issueId <= 0) {
  respond(400, ['status' => 'error', 'message' => 'Invalid issue_id']);
}

try {
  // Get issue, order, customer, vendor
  $sql = "SELECT 
            oi.issue_id,
            oi.order_id,
            oi.status AS issue_status,
            oi.issue_reason,
            oi.description AS issue_description,
            oi.vendor_decision,
              oi.vendor_feedback,
              oi.admin_feedback,
            oi.admin_decision,
            oi.customer_proof,
            oi.vendor_proof,
            oi.created_at AS issue_created_at,
            o.order_status,
            o.created_at AS order_created_at,
            o.total_price,
            o.delivery_fee,
            o.delivery_address,
            o.customer_note,
            c.customer_id,
            c.NAME AS customer_name,
            c.contact_number AS customer_contact,
            c.email AS customer_email,
            c.profile_image AS customer_image,
            v.vendor_id,
            v.business_name,
            v.contact_number AS vendor_contact,
            v.email AS vendor_email,
            v.profile_image AS vendor_image
          FROM order_issues oi
          LEFT JOIN orders o ON o.order_id = oi.order_id
          LEFT JOIN customers c ON c.customer_id = o.customer_id
          LEFT JOIN vendors v ON v.vendor_id = oi.vendor_id
          WHERE oi.issue_id = ?";

  $stmt = $conn->prepare($sql);
  if (!$stmt) throw new Exception('Failed to prepare issue query: ' . $conn->error);
  $stmt->bind_param('i', $issueId);
  if (!$stmt->execute()) throw new Exception('Failed to execute issue query: ' . $stmt->error);
  $res = $stmt->get_result();
  if ($res->num_rows === 0) {
    respond(404, ['status' => 'error', 'message' => 'Issue not found']);
  }
  $row = $res->fetch_assoc();

  // Items of the order (optional for details view)
  $itemsSql = "SELECT product_name, price_at_time, quantity FROM order_items WHERE order_id = ?";
  $stmt2 = $conn->prepare($itemsSql);
  if (!$stmt2) throw new Exception('Failed to prepare items query: ' . $conn->error);
  $stmt2->bind_param('i', $row['order_id']);
  if (!$stmt2->execute()) throw new Exception('Failed to execute items query: ' . $stmt2->error);
  $itemsRes = $stmt2->get_result();
  $items = [];
  while ($it = $itemsRes->fetch_assoc()) {
    $items[] = [
      'name' => $it['product_name'],
      'price' => (float)$it['price_at_time'],
      'quantity' => (int)$it['quantity'],
    ];
  }

  $payload = [
    'status' => 'success',
    'data' => [
      'issue' => [
        'issue_id' => (int)$row['issue_id'],
        'status' => $row['issue_status'],
        'reason' => $row['issue_reason'],
        'description' => $row['issue_description'],
        'vendor_decision' => $row['vendor_decision'],
        'vendor_feedback' => $row['vendor_feedback'],
          'admin_feedback' => $row['admin_feedback'],
        'admin_decision' => $row['admin_decision'],
        'customer_proof' => $row['customer_proof'],
        'vendor_proof' => $row['vendor_proof'],
        'created_at' => $row['issue_created_at'],
      ],
      'order' => [
        'order_id' => (int)$row['order_id'],
        'order_status' => $row['order_status'],
        'created_at' => $row['order_created_at'],
        'total_price' => (float)$row['total_price'],
        'delivery_fee' => isset($row['delivery_fee']) ? (float)$row['delivery_fee'] : null,
        'delivery_address' => $row['delivery_address'],
        'customer_note' => $row['customer_note'],
      ],
      'customer' => [
        'customer_id' => (int)$row['customer_id'],
        'name' => $row['customer_name'],
        'contact' => $row['customer_contact'],
        'email' => $row['customer_email'],
        'image' => $row['customer_image'] ?: 'default.png',
      ],
      'vendor' => [
        'vendor_id' => (int)$row['vendor_id'],
        'name' => $row['business_name'],
        'contact' => $row['vendor_contact'],
        'email' => $row['vendor_email'],
        'image' => $row['vendor_image'] ?: 'default.png',
      ],
      'items' => $items,
    ]
  ];

  respond(200, $payload);

} catch (Throwable $e) {
  respond(500, ['status' => 'error', 'message' => $e->getMessage()]);
}
?>