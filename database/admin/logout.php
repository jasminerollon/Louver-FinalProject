<?php
session_start();

// Unset all session variables
$_SESSION = [];

// Destroy the session
if (session_id() !== '' || isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}
session_destroy();

// Redirect to admin login
header('Location: ../../html/admin/admin-login.html');
exit;
