<?php
header('Content-Type: application/json');

require_once '../../database/connectDB.php';

try {
    // Validate vendor_id
    if (!isset($_GET['vendor_id'])) {
        echo json_encode([ 'success' => false, 'message' => 'vendor_id is required', 'products' => [] ]);
        exit;
    }

    $vendor_id = (int) $_GET['vendor_id'];
    if ($vendor_id <= 0) {
        echo json_encode([ 'success' => false, 'message' => 'Invalid vendor_id', 'products' => [] ]);
        exit;
    }

    // Fetch products for the vendor
    $sql = "SELECT product_id, vendor_id, NAME, image, description, price
            FROM products
            WHERE vendor_id = ?
            ORDER BY product_id DESC";

    if (!($stmt = $conn->prepare($sql))) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param('i', $vendor_id);
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $res = $stmt->get_result();
    $products = [];
    while ($row = $res->fetch_assoc()) {
        $products[] = [
            'product_id' => (int)$row['product_id'],
            'vendor_id'  => (int)$row['vendor_id'],
            'NAME'       => $row['NAME'],
            'image'      => $row['image'],
            'description'=> $row['description'],
            'price'      => (float)$row['price']
        ];
    }

    echo json_encode([ 'success' => true, 'products' => $products ]);

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([ 'success' => false, 'message' => $e->getMessage(), 'products' => [] ]);
}
