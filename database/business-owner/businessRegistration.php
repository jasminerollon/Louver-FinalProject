<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "louver");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Collect inputs
$business_name = $_POST['business_name'];
$business_number = $_POST['business_number'];
$location = $_POST['location'];

$first_name = $_POST['first_name'];
$last_name = $_POST['last_name'];
$owner_name = $first_name . " " . $last_name;

$contact_number = $_POST['contact_number'];
$email = $_POST['email'];

// --- CHECK FOR DUPLICATE BUSINESS NAME ---
$check = $conn->prepare("SELECT vendor_id FROM vendors WHERE business_name = ?");
$check->bind_param("s", $business_name);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo "<script>
            alert('Business name already exists! Please use a different name.');
            window.history.back();
          </script>";
    exit();
}
$check->close();
// -----------------------------------------

// Handle business permit file upload
$permit_name = $_FILES['business_permit']['name'];
$permit_temp = $_FILES['business_permit']['tmp_name'];
$upload_dir = "../../uploads/permits/";

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$permit_path = $upload_dir . $permit_name;
move_uploaded_file($permit_temp, $permit_path);

// Insert into vendors table
$sql = "INSERT INTO vendors (
            business_name, owner_name, contact_number, address, email,
            business_permit, profile_image, STATUS, rejection_reason, password_hash
        ) VALUES (?, ?, ?, ?, ?, ?, 'default.png', 'Pending', NULL, NULL)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssss", 
    $business_name,
    $owner_name,
    $contact_number,
    $location,
    $email,
    $permit_name
);

if ($stmt->execute()) {
    echo "<script>
            alert('Business registered successfully!');
            window.location.href='../../html/business-owner/business-owner-login.html';
          </script>";
} else {
    echo "<script>alert('Error registering business.'); window.history.back();</script>";
}

$stmt->close();
$conn->close();
?>