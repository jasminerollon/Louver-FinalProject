<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require_once "../../database/connectDB.php"; 

header("Content-Type: application/json");

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

if (!$conn) respond(["success" => false, "message" => "Database connection failed"]);
if (!isset($_SESSION['vendor_id'])) respond(["success" => false, "message" => "Unauthorized"], 401);

$vendor_id = $_SESSION['vendor_id'];

// ---------------- FETCH DATA ----------------
if (isset($_GET['fetch']) && $_GET['fetch'] === "true") {
    $stmt = $conn->prepare("
        SELECT business_name, owner_name, email, contact_number, address, profile_image, banner_image, business_permit
        FROM vendors 
        WHERE vendor_id = ?
    ");
    $stmt->bind_param("i", $vendor_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();
        $data['success'] = true; // Add success flag
        respond($data);
    }
    
    respond(["success" => false, "message" => "Vendor not found"], 404);
}

// ---------------- UPDATE DATA ----------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $business_name = $_POST['business_name'] ?? '';
        $owner_name = $_POST['owner_name'] ?? '';
        $email = $_POST['email'] ?? '';
        $contact_number = $_POST['contact_number'] ?? '';
        $address = $_POST['address'] ?? '';

        $uploadDir = "../../assets/pictures/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $profile_image = null;
        $banner_image = null;
        $business_permit = null;

        // PROFILE IMAGE
        if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION);
            $profile_image = "profile_" . $vendor_id . "_" . time() . "." . $ext;
            $target = $uploadDir . $profile_image;
            if (!getimagesize($_FILES['profile_image']['tmp_name']) || !move_uploaded_file($_FILES['profile_image']['tmp_name'], $target)) {
                respond(["success" => false, "message" => "Profile image upload failed"]);
            }
        }

        // BANNER IMAGE
        if (isset($_FILES['banner_image']) && $_FILES['banner_image']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['banner_image']['name'], PATHINFO_EXTENSION);
            $banner_image = "banner_" . $vendor_id . "_" . time() . "." . $ext;
            $target = $uploadDir . $banner_image;
            if (!getimagesize($_FILES['banner_image']['tmp_name']) || !move_uploaded_file($_FILES['banner_image']['tmp_name'], $target)) {
                respond(["success" => false, "message" => "Banner image upload failed"]);
            }
        }

        // BUSINESS PERMIT FILE
        if (isset($_FILES['business_permit']) && $_FILES['business_permit']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['business_permit']['name'], PATHINFO_EXTENSION);
            $business_permit = "permit_" . $vendor_id . "_" . time() . "." . $ext;
            $target = $uploadDir . $business_permit;
            if (!move_uploaded_file($_FILES['business_permit']['tmp_name'], $target)) {
                respond(["success" => false, "message" => "Business permit upload failed"]);
            }
        }

        // Build dynamic query
        $fields = "business_name=?, owner_name=?, email=?, contact_number=?, address=?";
        $params = [$business_name, $owner_name, $email, $contact_number, $address];
        $types = "sssss";

        if ($profile_image) { 
            $fields .= ", profile_image=?"; 
            $params[] = $profile_image; 
            $types .= "s"; 
        }
        
        if ($banner_image) { 
            $fields .= ", banner_image=?"; 
            $params[] = $banner_image; 
            $types .= "s"; 
        }
        
        if ($business_permit) { 
            $fields .= ", business_permit=?"; 
            $params[] = $business_permit; 
            $types .= "s"; 
        }

        $params[] = $vendor_id;
        $types .= "i";

        $stmt = $conn->prepare("UPDATE vendors SET $fields WHERE vendor_id=?");
        
        if (!$stmt) {
            respond(["success" => false, "message" => "Prepare failed: " . $conn->error]);
        }
        
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            respond(["success" => true, "message" => "Profile updated successfully"]);
        } else {
            respond(["success" => false, "message" => "Database error: " . $stmt->error]);
        }

    } catch (Exception $e) {
        respond(["success" => false, "message" => "Exception: " . $e->getMessage()]);
    }
}

respond(["success" => false, "message" => "Invalid request"], 405);
?>