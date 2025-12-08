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

// --- CHECK FOR DUPLICATE BUSINESS NAME / REG NUMBER ---
$check1 = $conn->prepare("SELECT vendor_id FROM vendors WHERE business_name = ?");
$check1->bind_param("s", $business_name);
$check1->execute();
$check1->store_result();
if ($check1->num_rows > 0) {
    echo "<script>alert('Business name already exists! Please use a different name.'); window.history.back();</script>";
    exit();
}
$check1->close();

$check2 = $conn->prepare("SELECT application_id FROM applications WHERE registration_no = ? OR business_name = ?");
$check2->bind_param("ss", $business_number, $business_name);
$check2->execute();
$check2->store_result();
if ($check2->num_rows > 0) {
    echo "<script>alert('An application with this business name or registration number already exists.'); window.history.back();</script>";
    exit();
}
$check2->close();
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

// Insert a new application (Pending)
$sql = "INSERT INTO applications (
            registration_no, vendor_id, business_name, owner_name, contact_number,
            address, email, location_detail, business_permit, description, status, rejection_reason, submitted_at
        ) VALUES (?, NULL, ?, ?, ?, ?, ?, NULL, ?, NULL, 'Pending', NULL, CURRENT_TIMESTAMP)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss",
    $business_number,
    $business_name,
    $owner_name,
    $contact_number,
    $location,
    $email,
    $permit_name
);

if ($stmt->execute()) {
    echo "<script>
                        alert('Application submitted successfully!');
            window.location.href='../../html/business-owner/business-owner-login.html';
          </script>";
} else {
    echo "<script>alert('Error registering business.'); window.history.back();</script>";
}

$stmt->close();
$conn->close();
?>