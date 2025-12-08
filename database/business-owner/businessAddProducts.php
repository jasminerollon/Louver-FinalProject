<?php
header('Content-Type: application/json');
session_start(); // Start session to access vendor_id

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "louver";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

// Check if vendor is logged in
if (!isset($_SESSION['vendor_id'])) {
    echo json_encode(["success" => false, "message" => "Vendor not logged in"]);
    exit;
}

$vendor_id = $_SESSION['vendor_id']; // Use logged-in vendor ID
$name = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$price = $_POST['price'] ?? '';

$imageName = "";
if (isset($_FILES['product_image']) && $_FILES['product_image']['name'] != "") {
    $imageName = time() . '_' . basename($_FILES['product_image']['name']);
    $tmpName = $_FILES['product_image']['tmp_name'];

    $uploadDir = __DIR__ . "/AddProductImage";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    move_uploaded_file($tmpName, $uploadDir . "/" . $imageName);
}

// Insert product into database
$stmt = $conn->prepare("
    INSERT INTO products (vendor_id, NAME, description, price, image)
    VALUES (?, ?, ?, ?, ?)
");
$stmt->bind_param("issds", $vendor_id, $name, $description, $price, $imageName);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "product" => [
            "product_id" => $stmt->insert_id,
            "vendor_id" => $vendor_id, // include vendor_id in response
            "NAME" => $name,
            "description" => $description,
            "price" => $price,
            "image" => $imageName
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
