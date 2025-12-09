<?php
header('Content-Type: application/json');
require_once '../connectDB.php';

session_start();
$customer_id = isset($_SESSION['customer_id']) ? $_SESSION['customer_id'] : 101;

$sql = "SELECT 
            o.*, 
            v.business_name, 
            v.profile_image, 
            v.vendor_id,
            oi.issue_status,
            oi.vendor_decision,
            oi.vendor_feedback,
            oi.issue_reason
        FROM orders o
        JOIN vendors v ON o.vendor_id = v.vendor_id
        LEFT JOIN (
            SELECT oi_inner.order_id,
                   oi_inner.status AS issue_status,
                   oi_inner.vendor_decision,
                   oi_inner.vendor_feedback,
                   oi_inner.issue_reason
            FROM order_issues oi_inner
            JOIN (
                SELECT order_id, MAX(issue_id) AS max_issue_id
                FROM order_issues
                GROUP BY order_id
            ) latest ON latest.max_issue_id = oi_inner.issue_id
        ) oi ON oi.order_id = o.order_id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $customer_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $order_id = $row['order_id'];
    
    // Fetch order items for this order
    $items_sql = "SELECT oi.*, p.NAME as product_name 
                  FROM order_items oi 
                  LEFT JOIN products p ON oi.product_id = p.product_id 
                  WHERE oi.order_id = ?";
    $items_stmt = $conn->prepare($items_sql);
    $items_stmt->bind_param("i", $order_id);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();
    
    $order_items = [];
    while ($item = $items_result->fetch_assoc()) {
        $order_items[] = [
            'product_id' => $item['product_id'],
            'product_name' => $item['product_name'],
            'quantity' => $item['quantity'],
            'price_at_time' => $item['price_at_time']
        ];
    }
    $items_stmt->close();
    
    $orders[] = [
        'order_id' => $row['order_id'],
        'vendor_id' => $row['vendor_id'],
        'vendor_name' => $row['business_name'],
        'vendor_image' => $row['profile_image'] ? $row['profile_image'] : 'default.png',
        'total_price' => number_format($row['total_price'], 2),
        'status' => $row['order_status'],
        'rejection_reason' => $row['rejection_reason'],
        'created_at' => $row['created_at'],
        'issue_status' => $row['issue_status'] ?? null,
        'vendor_decision' => $row['vendor_decision'] ?? null,
        'vendor_feedback' => $row['vendor_feedback'] ?? null,
        'issue_reason' => $row['issue_reason'] ?? null,
        'order_items' => $order_items
    ];
}

echo json_encode($orders);
$stmt->close();
$conn->close();
