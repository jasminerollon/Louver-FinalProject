<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "louver");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Collect inputs
$business_name = trim($_POST['business_name']);
$business_number = trim($_POST['business_number']);
$location = trim($_POST['location']);

$first_name = trim($_POST['first_name']);
$last_name = trim($_POST['last_name']);
$owner_name = $first_name . " " . $last_name;

$contact_number = trim($_POST['contact_number']);
$email = trim($_POST['email']);

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

// GENERATE AUTO-INCREMENT APPLICATION ID
$query = "SELECT application_id FROM applications WHERE application_id REGEXP '^A[0-9]+$' ORDER BY CAST(SUBSTRING(application_id, 2) AS UNSIGNED) DESC LIMIT 1";
$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $last_id = $row['application_id'];
    $number = (int)substr($last_id, 1);
    $next_number = $number + 1;
} else {
    $next_number = 1;
}

$application_id = "A" . str_pad($next_number, 3, "0", STR_PAD_LEFT);
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

// Insert a new application (Pending) with auto-generated application_id
$sql = "INSERT INTO applications (
            application_id, registration_no, vendor_id, business_name, owner_name, contact_number,
            address, email, location_detail, business_permit, description, status, rejection_reason, submitted_at
        ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, NULL, ?, NULL, 'Pending', NULL, CURRENT_TIMESTAMP)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo "<script>alert('Error preparing statement: " . $conn->error . "'); window.history.back();</script>";
    $conn->close();
    exit();
}

$stmt->bind_param("ssssssss",
    $application_id,
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
        alert('Application submitted successfully!\\nYour Application ID: " . $application_id . "');
        window.location.href='../../html/business-owner/business-owner-login.html';
    </script>";
} else {
    echo "<script>alert('Error registering business: " . $stmt->error . "'); window.history.back();</script>";
}

$stmt->close();
$conn->close();
?>