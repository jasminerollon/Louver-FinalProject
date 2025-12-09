<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';

$response = [ 'status' => 'error', 'message' => 'Unknown error', 'data' => [] ];

try {
    // Join through orders to get customer and totals; schema does not have oi.total_amount or oi.customer_id
    $sql = "SELECT 
                oi.issue_id,
                oi.order_id,
                oi.created_at,
                oi.status,
                o.total_price AS total_amount,
                c.NAME AS customer_name,
                v.business_name AS business_name
            FROM order_issues oi
            INNER JOIN orders o ON o.order_id = oi.order_id
            INNER JOIN customers c ON c.customer_id = o.customer_id
            INNER JOIN vendors v ON v.vendor_id = oi.vendor_id
            ORDER BY oi.created_at DESC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute statement: ' . $stmt->error);
    }
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $dateObj = new DateTime($row['created_at']);
        $dateLabel = $dateObj->format('M d, Y');
        $timeLabel = $dateObj->format('h:i A');
        $rows[] = [
            'issue_id' => (int)$row['issue_id'],
            'order_id' => (int)$row['order_id'],
            'date' => $dateLabel . ' | ' . $timeLabel,
            'customer' => $row['customer_name'] ?? '',
            'business' => $row['business_name'] ?? '',
            'total' => (float)($row['total_amount'] ?? 0),
            'status' => $row['status'] ?? 'Pending'
        ];
    }
    $response['status'] = 'success';
    $response['message'] = 'OK';
    $response['data'] = $rows;
} catch (Throwable $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
