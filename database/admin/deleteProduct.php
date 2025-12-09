<?php
header('Content-Type: application/json');
require_once '../../database/connectDB.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['product_id']) || !isset($input['vendor_id']) || !isset($input['reason'])) {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    $product_id = (int)$input['product_id'];
    $vendor_id = (int)$input['vendor_id'];
    $reason = trim($input['reason']);

    if ($product_id <= 0 || $vendor_id <= 0 || $reason === '') {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        exit;
    }

    // Check for ongoing orders (Preparing or Ready) for this product
    $checkSql = "SELECT oi.order_item_id
                 FROM order_items oi
                 JOIN orders o ON o.order_id = oi.order_id
                 WHERE oi.product_id = ? AND o.order_status IN ('Preparing','Ready')
                 LIMIT 1";
    if (!($stmt = $conn->prepare($checkSql))) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param('i', $product_id);
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Cannot remove product with ongoing orders.']);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    // Log deletion reason
    $logSql = "CREATE TABLE IF NOT EXISTS product_deletions (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  product_id INT NOT NULL,
                  vendor_id INT NOT NULL,
                  reason TEXT NOT NULL,
                  deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
               ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
    $conn->query($logSql);

    $ins = $conn->prepare('INSERT INTO product_deletions (product_id, vendor_id, reason) VALUES (?, ?, ?)');
    if (!$ins) { throw new Exception('Prepare failed: ' . $conn->error); }
    $ins->bind_param('iis', $product_id, $vendor_id, $reason);
    if (!$ins->execute()) { throw new Exception('Insert failed: ' . $ins->error); }
    $ins->close();

    // Delete product (hard delete)
    $del = $conn->prepare('DELETE FROM products WHERE product_id = ? AND vendor_id = ?');
    if (!$del) { throw new Exception('Prepare failed: ' . $conn->error); }
    $del->bind_param('ii', $product_id, $vendor_id);
    if (!$del->execute()) { throw new Exception('Execute failed: ' . $del->error); }

    if ($del->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Product not found or already removed']);
    }

    $del->close();
    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
