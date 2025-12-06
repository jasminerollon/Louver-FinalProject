<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "louver";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("DB connection failed: " . $conn->connect_error);
}

$name = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$price = $_POST['price'] ?? '';
$vendor_id = 1; // replace with actual logged-in vendor ID

$imageName = "";
if(isset($_FILES['product_image']) && $_FILES['product_image']['name'] != ""){
    $imageName = time() . '_' . basename($_FILES['product_image']['name']);
    $tmpName = $_FILES['product_image']['tmp_name'];
    $uploadDir = __DIR__ . "/AddProductImage";
    if(!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    move_uploaded_file($tmpName, $uploadDir . "/" . $imageName);
}

// Insert into DB
$stmt = $conn->prepare("INSERT INTO products (vendor_id, NAME, description, price, image) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issds", $vendor_id, $name, $description, $price, $imageName);

if($stmt->execute()){
    // Redirect to products.html after saving
    header("Location: ../../html/business-owner/business-owner-products.html");
    exit;
}else{
    echo "Error: " . $stmt->error;
}

$conn->close();
