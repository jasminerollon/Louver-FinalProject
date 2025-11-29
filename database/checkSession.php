<?php
session_start();
header("Content-Type: application/json");

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        'logged_in' => true,
        'customer_id' => $_SESSION['customer_id'],
        'customer_name' => $_SESSION['customer_name']
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>
