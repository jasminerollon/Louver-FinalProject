<?php
session_start();
$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$vendor_id = $_SESSION['vendor_id'] ?? 1;
$product_id = $_GET['id'] ?? null;

if (!$product_id) {
    echo json_encode(['error' => 'No product selected.']);
    exit;
}

// Fetch product info
$stmt = $conn->prepare("SELECT * FROM products WHERE product_id=? AND vendor_id=?");
$stmt->bind_param("ii", $product_id, $vendor_id);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    $name = $row['NAME'];
    $description = $row['description'];
    $price = $row['price'];
    $image = $row['image'];
} else {
    echo json_encode(['error' => 'Product not found.']);
    exit;
}

// Handle POST request (AJAX or normal form)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Cancel
    if (isset($_POST['cancel'])) {
        header("Location: ../../html/business-owner/business-owner-products.html");
        exit;
    }

    // Delete
    if (isset($_POST['delete'])) {
        $stmt = $conn->prepare("DELETE FROM products WHERE product_id=? AND vendor_id=?");
        $stmt->bind_param("ii", $product_id, $vendor_id);
        $stmt->execute();
        header("Location: ../../html/business-owner/business-owner-products.html");
        exit;
    }

    $name = $_POST['name'];
    $description = $_POST['description'];
    $price = $_POST['price'];
    $image_path = $_POST['existing_image'] ?? $image;

  // Handle image upload
if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
    $imageName = time() . "_" . basename($_FILES['image']['name']);
    $targetPath = __DIR__ . "/../../businessphotos/" . $imageName; // absolute path
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        $image_path = "businessphotos/".$imageName; // path for database
    } else {
        // handle error
        $image_path = null;
    }
}


    $stmt = $conn->prepare("UPDATE products SET NAME=?, description=?, price=?, image=? WHERE product_id=? AND vendor_id=?");
    $stmt->bind_param("ssdssi", $name, $description, $price, $image_path, $product_id, $vendor_id);
    $stmt->execute();

    // Return JSON for AJAX
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        echo json_encode(['success' => true]);
        exit;
    }

    // Normal form redirect
    header("Location: ../../html/business-owner/business-owner-products.html");
    exit;

    
}
// Make the image path web-accessible
$image_path = $image ? "/Louver-Finalproject/" . $image : ""; 

echo json_encode([
    'name' => $name,
    'description' => $description,
    'price' => $price,
    'image' => $image_path
]);
?>