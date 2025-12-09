<?php
header('Content-Type: application/json');
session_start();

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "louver";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Get POST data
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

// Fetch vendor by email
$stmt = $conn->prepare("SELECT vendor_id, email, password_hash, business_name FROM vendors WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    exit;
}

$vendor = $result->fetch_assoc();

// Compare plain password
if ($password === $vendor['password_hash']) {
    // Login successful
    $_SESSION['vendor_id'] = $vendor['vendor_id'];
    $_SESSION['vendor_email'] = $vendor['email'];
    $_SESSION['vendor_name'] = $vendor['business_name'];

    // Optional: mark session status as online
    $conn->query("UPDATE vendors SET session_status='Online' WHERE vendor_id=" . $vendor['vendor_id']);

    echo json_encode(["success" => true, "message" => "Login successful"]);
    exit;
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    exit;
}
?>
