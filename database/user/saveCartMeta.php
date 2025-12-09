<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';
session_start();

$customer_id = isset($_SESSION['customer_id']) ? intval($_SESSION['customer_id']) : 2;
$address = isset($_POST['delivery_address']) ? trim($_POST['delivery_address']) : '';
$note = isset($_POST['note']) ? trim($_POST['note']) : '';

if (!$customer_id) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// Ensure table exists (lightweight migration)
$conn->query("
CREATE TABLE IF NOT EXISTS cart_meta (
    customer_id INT NOT NULL PRIMARY KEY,
    delivery_address TEXT,
    note TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
");

$stmt = $conn->prepare("
INSERT INTO cart_meta (customer_id, delivery_address, note)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE delivery_address = VALUES(delivery_address), note = VALUES(note), updated_at = CURRENT_TIMESTAMP
");
$stmt->bind_param("iss", $customer_id, $address, $note);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save delivery info']);
}

