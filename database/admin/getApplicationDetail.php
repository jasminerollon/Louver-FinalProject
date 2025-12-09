<?php
session_start();
header('Content-Type: application/json');

// Include database connection
require_once '../../database/connectDB.php';

// Check if application_id is provided
if (!isset($_GET['application_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Application ID is required']);
    exit;
}

$application_id = $_GET['application_id'];

try {
    // Fetch application details
    $query = "SELECT 
                application_id,
                registration_no,
                vendor_id,
                business_name,
                owner_name,
                contact_number,
                address,
                email,
                temp_password,
                business_permit,
                description,
                status,
                rejection_reason,
                submitted_at
              FROM applications
              WHERE application_id = ?";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("s", $application_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Application not found']);
        exit;
    }
    
    $application = $result->fetch_assoc();
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => [
            'application_id' => $application['application_id'],
            'registration_no' => $application['registration_no'],
            'vendor_id' => $application['vendor_id'],
            'business_name' => $application['business_name'],
            'owner_name' => $application['owner_name'],
            'contact_number' => $application['contact_number'],
            'address' => $application['address'],
            'email' => $application['email'],
            'address' => $application['address'],
            'temp_password' => $application['temp_password'],
            'business_permit' => $application['business_permit'],
            'description' => $application['description'],
            'status' => $application['status'],
            'rejection_reason' => $application['rejection_reason'],
            'date_submitted' => date('M d, Y', strtotime($application['submitted_at']))
        ]
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>