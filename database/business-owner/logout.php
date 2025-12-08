<?php
session_start();

// Capture vendor id before clearing session
$vendorId = isset($_SESSION['vendor_id']) ? (int)$_SESSION['vendor_id'] : 0;

// If we have a vendor id, set session_status to Offline
if ($vendorId > 0) {
	$conn = new mysqli("localhost", "root", "", "louver");
	if (!$conn->connect_error) {
		$stmt = $conn->prepare("UPDATE vendors SET session_status='Offline' WHERE vendor_id = ?");
		if ($stmt) {
			$stmt->bind_param("i", $vendorId);
			$stmt->execute();
			$stmt->close();
		}
		$conn->close();
	}
}

// Clear all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Redirect to login
header("Location: ../../html/business-owner/business-owner-login.html");
exit();
?>
