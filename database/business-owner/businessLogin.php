<?php
session_start();

// DB connection
$conn = new mysqli("localhost", "root", "", "louver");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get POST data from login form
$email = $_POST['email'];
$password = $_POST['password'];

// Prepare statement to prevent SQL injection
$stmt = $conn->prepare("SELECT vendor_id, business_name, password_hash FROM vendors WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $vendor = $result->fetch_assoc();

    // Compare password (plaintext now, change to password_verify if hashed)
    if ($password === $vendor['password_hash']) {
        // Login successful — store session variables
        $_SESSION['vendor_id'] = $vendor['vendor_id'];
        $_SESSION['vendor_name'] = $vendor['business_name'];

        // Redirect to vendor products page
        header("Location: ../../html/business-owner/business-owner-products.html");
        exit;
    } else {
        // Wrong password → show modal
        header("Location: ../../html/business-owner/business-owner-login.html?error=1");
        exit;
    }
} else {
    // Email not found → show modal
    header("Location: ../../html/business-owner/business-owner-login.html?error=1");
    exit;
}
?>