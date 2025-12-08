<?php
session_start();
header('Content-Type: application/json');

// Check if admin is logged in - comment out for development
// if (!isset($_SESSION['admin_id'])) {
//     http_response_code(401);
//     echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
//     exit;
// }

// Include database connection
require_once '../../database/connectDB.php';

try {
        // Fetch all business applications from applications table
        $query = "SELECT 
                                application_id,
                                registration_no,
                                vendor_id,
                                business_name,
                                owner_name,
                                contact_number,
                                email,
                                status,
                                submitted_at
                            FROM applications
                            ORDER BY submitted_at DESC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $applications = [];
    
    while ($row = $result->fetch_assoc()) {
        $applications[] = [
            'application_id' => $row['application_id'],
            'registration_no' => $row['registration_no'],
            'vendor_id' => $row['vendor_id'],
            'business_name' => $row['business_name'],
            'owner_name' => $row['owner_name'],
            'contact_number' => $row['contact_number'],
            'email' => $row['email'],
            'status' => ucfirst(strtolower($row['status'])),
            'date_submitted' => date('M d, Y', strtotime($row['submitted_at']))
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => $applications
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
