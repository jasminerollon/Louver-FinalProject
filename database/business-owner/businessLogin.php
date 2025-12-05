<?php
session_start();

// DB connection
$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$email = $_POST['email'];
$password = $_POST['password'];

// Prepared statement
$stmt = $conn->prepare("SELECT admin_id, username, name, password_hash FROM admins WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $admin = $result->fetch_assoc();

    if ($password === $admin['password_hash']) {
        // Login success
        $_SESSION['admin_id'] = $admin['admin_id'];
        $_SESSION['admin_name'] = $admin['name'];
        $_SESSION['username'] = $admin['username'];

        // Redirect to products page
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