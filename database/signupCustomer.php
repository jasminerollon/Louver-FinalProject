<?php
session_start();
header('Content-Type: application/json');

require 'connectDB.php';

$first_name = $_POST['first_name'] ?? '';
$last_name = $_POST['last_name'] ?? '';
$contact_number = $_POST['contact_number'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// simple validation
if (empty($first_name) || empty($last_name) || empty($contact_number) || empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

//  hash the password (kau implement po pls error sakin so much)
// $password_hash = password_hash($password, PASSWORD_DEFAULT);

// plain text password for now
$password_hash = $password;

try {
    // prepare statement to insert customer
    $stmt = $conn->prepare("INSERT INTO customers (NAME, contact_number, email, password_hash) VALUES (?, ?, ?, ?)");
    $full_name = $first_name . ' ' . $last_name;
    $stmt->bind_param("ssss", $full_name, $contact_number, $email, $password_hash);

    if ($stmt->execute()) {
        header("Location: /Louver-FinalProject/html/user/login.html");
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Email already exists or database error']);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
