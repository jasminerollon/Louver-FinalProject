<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../connectDB.php";

try {
    $vendor_id = isset($_GET['vendor_id']) ? intval($_GET['vendor_id']) : 0;
    
    if ($vendor_id <= 0) {
        echo json_encode(["error" => "Invalid vendor ID"]);
        exit;
    }

    // Get vendor details
    $vendorQuery = "SELECT vendor_id, business_name, owner_name, contact_number, 
                    address, email, description, estimated_time, location_detail, 
                    profile_image 
                    FROM vendors 
                    WHERE vendor_id = ? AND STATUS = 'Approved'";
    
    $stmt = $conn->prepare($vendorQuery);
    $stmt->bind_param("i", $vendor_id);
    $stmt->execute();
    $vendorResult = $stmt->get_result();
    
    if ($vendorResult->num_rows === 0) {
        echo json_encode(["error" => "Vendor not found or not approved"]);
        exit;
    }
    
    $vendor = $vendorResult->fetch_assoc();
    
    // Get products grouped by category
    $productsQuery = "SELECT product_id, NAME, category, image, description, price 
                      FROM products 
                      WHERE vendor_id = ? 
                      ORDER BY 
                        CASE category 
                          WHEN 'Popular' THEN 1 
                          ELSE 2 
                        END,
                        category ASC,
                        NAME ASC";
    
    $stmt = $conn->prepare($productsQuery);
    $stmt->bind_param("i", $vendor_id);
    $stmt->execute();
    $productsResult = $stmt->get_result();
    
    $products = [];
    $hasProducts = false;
    
    while ($row = $productsResult->fetch_assoc()) {
        $hasProducts = true;
        $category = $row['category'] ?: 'Other';
        if (!isset($products[$category])) {
            $products[$category] = [];
        }
        $products[$category][] = $row;
    }
    
    $response = [
        "vendor" => $vendor,
        "menu" => $products,
        "hasProducts" => $hasProducts
    ];
    
    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
