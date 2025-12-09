<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../connectDB.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }

    $email = $_POST['email'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    // Validate inputs
    if (empty($email) || empty($newPassword) || empty($confirmPassword)) {
        echo json_encode(['success' => false, 'message' => 'Please fill all fields']);
        exit;
    }

    if ($newPassword !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match!']);
        exit;
    }

    if (strlen($newPassword) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        exit;
    }

    // Check if customer exists
    $stmt = $conn->prepare("SELECT customer_id FROM customers WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Email not found']);
        exit;
    }

    $customer = $result->fetch_assoc();
    $customerId = $customer['customer_id'];

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password
    $stmt = $conn->prepare("UPDATE customers SET password_hash = ? WHERE customer_id = ?");
    $stmt->bind_param("si", $hashedPassword, $customerId);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Password reset successful! Redirecting to login...'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update password']);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
} finally {
    $conn->close();
}
?>
