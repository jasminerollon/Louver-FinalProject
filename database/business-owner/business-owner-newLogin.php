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
$stmt = $conn->prepare("SELECT vendor_id, email, password_hash, business_name FROM vendors WHERE email=? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    exit;
}

$vendor = $result->fetch_assoc();
$vendorId = (int)$vendor['vendor_id'];

// 1) Try hashed password, then allow legacy plain equality
$valid = false;
if (!empty($vendor['password_hash'])) {
    if (password_verify($password, $vendor['password_hash'])) {
        $valid = true;
    } else if (hash_equals($vendor['password_hash'], $password)) {
        $valid = true;
    }
}

// 2) If not valid yet, allow approved application temp password
if (!$valid) {
    $a = $conn->prepare("SELECT vendor_id FROM applications WHERE email = ? AND status='Approved' AND temp_password = ? ORDER BY reviewed_at DESC LIMIT 1");
    if ($a) {
        $a->bind_param("ss", $email, $password);
        $a->execute();
        $ar = $a->get_result();
        if ($ar && $ar->num_rows === 1) {
            $row = $ar->fetch_assoc();
            // If vendor_id exists, trust it; otherwise fall back to current vendorId
            $approvedVendorId = (int)($row['vendor_id'] ?? $vendorId);
            if ($approvedVendorId === $vendorId || $approvedVendorId > 0) {
                $valid = true;
                // Persist hash so future logins use bcrypt
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $up = $conn->prepare("UPDATE vendors SET password_hash = ? WHERE vendor_id = ?");
                if ($up) { $up->bind_param("si", $newHash, $vendorId); $up->execute(); $up->close(); }
            }
        }
        $a->close();
    }
}

if (!$valid) {
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    exit;
}

// Login successful
$_SESSION['vendor_id'] = $vendorId;
$_SESSION['vendor_email'] = $vendor['email'];
$_SESSION['vendor_name'] = $vendor['business_name'];

// Mark Online
$on = $conn->prepare("UPDATE vendors SET session_status='Online' WHERE vendor_id = ?");
if ($on) { $on->bind_param("i", $vendorId); $on->execute(); $on->close(); }

echo json_encode(["success" => true, "message" => "Login successful", "vendor_id" => $vendorId]);
exit;
?>
