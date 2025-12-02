<?php
// database/business-owner/businessSession.php
session_start();

// Check if vendor is logged in
if (!isset($_SESSION['vendor_id'])) {
    header("Location: ../../html/business-owner/business-owner-login.html");
    exit();
}

// Include database connection
include_once '../../connectDB.php';

// Fetch vendor info
$vendor_id = $_SESSION['vendor_id'];
$sql = "SELECT * FROM vendors WHERE vendor_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $vendor_id);
$stmt->execute();
$result = $stmt->get_result();
$vendor = $result->fetch_assoc();

// Variables for the HTML page
$status = $vendor['STATUS']; // Pending / Approved / Rejected
$rejection_reason = $vendor['rejection_reason'];
$email = $vendor['email'];
$password = $vendor['password_hash'];
?>
