<?php
header('Content-Type: application/json');
require_once '../connectDB.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

// Get form data
$order_id = isset($_POST['order_id']) ? (int)$_POST['order_id'] : null;
$vendor_id = isset($_POST['vendor_id']) ? (int)$_POST['vendor_id'] : null;
$issue_reason = isset($_POST['issue_category']) ? $conn->real_escape_string($_POST['issue_category']) : null;
$description = isset($_POST['description']) ? $conn->real_escape_string($_POST['description']) : '';

// Validate required fields
if (!$order_id || !$vendor_id || !$issue_reason) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Handle file upload
$customer_proof_path = null;
if (isset($_FILES['customer_proof']) && $_FILES['customer_proof']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['customer_proof'];
    $allowed_types = ['image/jpeg','image/png','image/gif'];

    if (in_array($file['type'], $allowed_types)) {
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $newName = 'proof_' . time() . '_' . rand(1000,9999) . '.' . $ext;

        $uploadDir = __DIR__ . '/../../assets/uploads/customer_proofs/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $destination = $uploadDir . $newName;
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            $customer_proof_path = 'assets/uploads/customer_proofs/' . $newName;
        } else {
            echo json_encode(['success'=>false,'message'=>'Failed to move uploaded file']);
            exit;
        }
    } else {
        echo json_encode(['success'=>false,'message'=>'Invalid file type']);
        exit;
    }
}

// Insert into order_issues with vendor_id
$stmt = $conn->prepare("
    INSERT INTO order_issues
    (order_id, vendor_id, customer_proof, issue_reason, description) 
    VALUES (?, ?, ?, ?, ?)
");
$stmt->bind_param("iisss", $order_id, $vendor_id, $customer_proof_path, $issue_reason, $description);

if ($stmt->execute()) {
    // Optionally mark the order as reported so it can surface in the UI
    $updateOrder = $conn->prepare("UPDATE orders SET order_status = 'Reported' WHERE order_id = ?");
    if ($updateOrder) {
        $updateOrder->bind_param("i", $order_id);
        $updateOrder->execute();
        $updateOrder->close();
    }
    echo json_encode(['success'=>true,'message'=>'Report submitted successfully']);
} else {
    echo json_encode(['success'=>false,'message'=>'Database error: '.$conn->error]);
}

$stmt->close();
$conn->close();
