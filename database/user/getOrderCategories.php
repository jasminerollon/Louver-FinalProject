<?php
header('Content-Type: application/json');
require_once '../connectDB.php';

// Get enum values for issue_reason column
$result = $conn->query("SHOW COLUMNS FROM order_issues LIKE 'issue_reason'");
$categories = [];

if ($result) {
    $row = $result->fetch_assoc();
    $type = $row['Type']; // enum('Did not receive products','Wrong item delivered',...)
    
    // Extract the values inside the enum
    preg_match_all("/'([^']+)'/", $type, $matches);
    $categories = $matches[1];
}

echo json_encode($categories);
$conn->close();
