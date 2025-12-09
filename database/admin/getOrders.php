<?php
session_start();
header('Content-Type: application/json');

require_once '../../database/connectDB.php';

try {
    // Fetch orders with customer and business names
    $query = "SELECT 
                o.order_id,
                o.created_at,
                o.total_price,
                o.order_status,
                o.delivery_fee,
                o.customer_note,
                o.delivery_address,
                c.NAME AS customer_name,
                v.business_name AS vendor_name
              FROM orders o
              LEFT JOIN customers c ON c.customer_id = o.customer_id
              LEFT JOIN vendors v ON v.vendor_id = o.vendor_id
              ORDER BY o.created_at DESC";

    $result = $conn->query($query);
    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'order_id' => (int)$row['order_id'],
            'date' => date('M d, Y | h:i A', strtotime($row['created_at'])),
            'customer' => $row['customer_name'] ?? 'Unknown',
            'business' => $row['vendor_name'] ?? 'Unknown',
            'total' => (float)$row['total_price'],
            'status' => $row['order_status'],
            'delivery_fee' => isset($row['delivery_fee']) ? (float)$row['delivery_fee'] : null,
            'customer_note' => $row['customer_note'] ?? null,
            'delivery_address' => $row['delivery_address'] ?? null
        ];
    }

    http_response_code(200);
    echo json_encode(['status' => 'success', 'data' => $orders]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();