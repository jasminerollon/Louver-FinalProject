<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../connectDB.php";

try {
    $query = "SELECT vendor_id, business_name, address, profile_image, banner_image,
                     description, estimated_time, contact_number 
            FROM vendors 
            ORDER BY business_name ASC";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $result = $stmt->get_result();

    $vendors = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($vendors);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
