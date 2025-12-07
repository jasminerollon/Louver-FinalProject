<?php
session_start();
require_once "../../database/connectDB.php";

if (!isset($_SESSION['vendor_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$vendor_id = $_SESSION['vendor_id'];

// Fetch current data
if (isset($_GET['fetch']) && $_GET['fetch'] == "true") {
    $stmt = $conn->prepare("SELECT business_name, owner_name, email, contact_number, address, profile_image, banner_image, location_detail FROM vendors WHERE vendor_id = ?");
    $stmt->bind_param("i", $vendor_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    echo json_encode($result);
    exit();
}

// Update data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $business_name = $_POST['business_name'];
    $owner_name = $_POST['owner_name'];
    $email = $_POST['email'];
    $contact_number = $_POST['contact_number'];
    $location = $_POST['location'];
    $business_number = $_POST['business_number'];

    $profile_image = null;
    $banner_image = null;
    $uploadDir = "../../assets/pictures/";

    // Handle profile image
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $profile_image = basename($_FILES['profile_image']['name']);
        $targetFile = $uploadDir . $profile_image;
        if (!move_uploaded_file($_FILES['profile_image']['tmp_name'], $targetFile)) {
            echo json_encode(["success" => false, "message" => "Failed to upload profile image"]);
            exit();
        }
    }

    // Handle banner image
    if (isset($_FILES['banner_image']) && $_FILES['banner_image']['error'] === UPLOAD_ERR_OK) {
        $banner_image = basename($_FILES['banner_image']['name']);
        $targetFile = $uploadDir . $banner_image;
        if (!move_uploaded_file($_FILES['banner_image']['tmp_name'], $targetFile)) {
            echo json_encode(["success" => false, "message" => "Failed to upload banner image"]);
            exit();
        }
    }

    $stmt = $conn->prepare("
        UPDATE vendors 
        SET business_name=?, owner_name=?, email=?, contact_number=?, location_detail=?, address=?, 
            profile_image=COALESCE(?, profile_image),
            banner_image=COALESCE(?, banner_image)
        WHERE vendor_id=?
    ");
    $stmt->bind_param("sssssssii", $business_name, $owner_name, $email, $contact_number, $location, $business_number, $profile_image, $banner_image, $vendor_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}
?>
