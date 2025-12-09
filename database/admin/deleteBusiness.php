<?php
header('Content-Type: application/json');
require_once '../../database/connectDB.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['vendor_id']) || !isset($input['reason'])) {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    $vendor_id = (int)$input['vendor_id'];
    $reason = trim($input['reason']);

    if ($vendor_id <= 0 || $reason === '') {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        exit;
    }

    // Guard: no ongoing orders for this vendor
    $checkSql = "SELECT 1 FROM orders WHERE vendor_id = ? AND order_status IN ('Preparing','Ready') LIMIT 1";
    if (!($stmt = $conn->prepare($checkSql))) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param('i', $vendor_id);
    if (!$stmt->execute()) { throw new Exception('Execute failed: ' . $stmt->error); }
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Cannot remove business with ongoing orders.']);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    // Log deletion
    $logSql = "CREATE TABLE IF NOT EXISTS business_deletions (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  vendor_id INT NOT NULL,
                  reason TEXT NOT NULL,
                  deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  deleted_by_admin INT DEFAULT NULL
               ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
    $conn->query($logSql);

    $ins = $conn->prepare('INSERT INTO business_deletions (vendor_id, reason) VALUES (?, ?)');
    if (!$ins) { throw new Exception('Prepare failed: ' . $conn->error); }
    $ins->bind_param('is', $vendor_id, $reason);
    if (!$ins->execute()) { throw new Exception('Insert failed: ' . $ins->error); }
    $ins->close();

    // Optionally log product deletions for audit before deletion
    $conn->query("CREATE TABLE IF NOT EXISTS product_deletions (id INT AUTO_INCREMENT PRIMARY KEY, product_id INT, vendor_id INT, reason TEXT, deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci");
    $res = $conn->query("SELECT product_id FROM products WHERE vendor_id = " . (int)$vendor_id);
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $pid = (int)$row['product_id'];
            $conn->query("INSERT INTO product_deletions (product_id, vendor_id, reason) VALUES ($pid, $vendor_id, 'Business removed')");
        }
    }

    // Delete products then vendor
    $delProducts = $conn->prepare('DELETE FROM products WHERE vendor_id = ?');
    if (!$delProducts) { throw new Exception('Prepare failed: ' . $conn->error); }
    $delProducts->bind_param('i', $vendor_id);
    if (!$delProducts->execute()) { throw new Exception('Execute failed: ' . $delProducts->error); }
    $delProducts->close();

    $delVendor = $conn->prepare('DELETE FROM vendors WHERE vendor_id = ?');
    if (!$delVendor) { throw new Exception('Prepare failed: ' . $conn->error); }
    $delVendor->bind_param('i', $vendor_id);
    if (!$delVendor->execute()) { throw new Exception('Execute failed: ' . $delVendor->error); }

    if ($delVendor->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Vendor not found or already removed']);
    }

    $delVendor->close();
    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
