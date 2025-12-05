<?php
session_start();
require_once '../connectDB.php';

// Use session customer_id or fallback from POST
$customer_id = $_SESSION['customer_id'] ?? $_POST['customer_id'] ?? null;
if (!$customer_id) {
    echo json_encode(['status'=>'error','message'=>'No customer ID']);
    exit;
}

// Check file upload
if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== 0) {
    echo json_encode(['status'=>'error', 'message'=>'No file uploaded']);
    exit;
}

// Validate file type
$allowedTypes = ['image/png','image/jpeg','image/jpg'];
if (!in_array($_FILES['profile_image']['type'], $allowedTypes)) {
    echo json_encode(['status'=>'error', 'message'=>'Only PNG/JPG allowed']);
    exit;
}

// Upload directory
$uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Louver-FinalProject/assets/uploads/profile_images/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

// Generate unique filename
$tmpName = $_FILES['profile_image']['tmp_name'];
$ext = pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION);
$filename = uniqid() . '.' . $ext;
$targetFile = $uploadDir . $filename;

// Move file
if (!move_uploaded_file($tmpName, $targetFile)) {
    echo json_encode(['status'=>'error','message'=>'Failed to upload image']);
    exit;
}

// Delete old image if not default
$stmt = $conn->prepare("SELECT profile_image FROM customers WHERE customer_id=?");
$stmt->bind_param("i",$customer_id);
$stmt->execute();
$stmt->bind_result($currentImage);
$stmt->fetch();
$stmt->close();

if ($currentImage && $currentImage !== 'default.png' && file_exists($uploadDir . $currentImage)) {
    unlink($uploadDir . $currentImage);
}

// Update database immediately
$stmt = $conn->prepare("UPDATE customers SET profile_image=? WHERE customer_id=?");
$stmt->bind_param("si",$filename,$customer_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'status'=>'success',
            'message'=>'Profile image updated successfully',
            'profile_image'=>$filename
        ]);
    } else {
        echo json_encode(['status'=>'error','message'=>'No rows updated. Check customer_id']);
    }
} else {
    echo json_encode(['status'=>'error','message'=>'Database update failed']);
}

$stmt->close();
$conn->close();
?>
