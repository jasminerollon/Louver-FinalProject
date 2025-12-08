<?php
session_start();

// DB connection
$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get POST data from login form
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Prepare statement to prevent SQL injection
$stmt = $conn->prepare("SELECT vendor_id, business_name, password_hash, STATUS FROM vendors WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $vendor = $result->fetch_assoc();

    // Compare password
    if ($password === $vendor['password_hash']) { // Use password_verify() if hashed
        $_SESSION['vendor_id'] = $vendor['vendor_id'];
        $_SESSION['vendor_name'] = $vendor['business_name'];

        // Redirect based on STATUS
        switch ($vendor['STATUS']) {
            case 'Pending':
            case 'Rejected':
                header("Location: ../../html/business-owner/business-owner-status.php");
                exit;
            case 'Approved':
                header("Location: ../../html/business-owner/business-owner-products.html");
                exit;
            default:
                header("Location: ../../html/business-owner/business-owner-login.html?error=1");
                exit;
        }
    } else {
        header("Location: ../../html/business-owner/business-owner-login.html?error=1");
        exit;
    }
} else {
    header("Location: ../../html/business-owner/business-owner-login.html?error=1");
    exit;
}
?>