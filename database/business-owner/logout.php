<?php
session_start();

// Clear all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Redirect to login
header("Location: ../../html/business-owner/business-owner-login.html");
exit();
?>
