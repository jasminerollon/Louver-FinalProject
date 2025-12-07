<?php
session_start();

// Check if logged in
if (!isset($_SESSION['vendor_id'])) {
    header("Location: ../../html/business-owner/business-owner-login.html");
    exit();
}

// DB connection
$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch vendor data
$vendor_id = $_SESSION['vendor_id'];
$stmt = $conn->prepare("SELECT * FROM vendors WHERE vendor_id = ?");
$stmt->bind_param("i", $vendor_id);
$stmt->execute();
$result = $stmt->get_result();
$vendor = $result->fetch_assoc();

// Assign variables for status page
$status = $vendor['STATUS']; // Pending / Approved / Rejected
$rejection_reason = $vendor['rejection_reason'];
$email = $vendor['email'];
$password = $vendor['password_hash']; // hashed password
?>
