<?php
session_start();
header('Content-Type: application/json');

require_once '../../database/connectDB.php';

try {
        // Fetch vendors that have an approved application
        // Join the latest approved application to retrieve application-specific fields
        $query = "SELECT 
                                v.vendor_id,
                                v.business_name,
                                v.owner_name,
                                v.email,
                                v.contact_number,
                                v.address,
                                v.estimated_time,
                                '' AS location_detail,
                                v.profile_image,
                                v.session_status,
                                v.created_at
                            FROM vendors v
                            INNER JOIN (
                                SELECT a1.vendor_id, a1.reviewed_at
                                FROM applications a1
                                WHERE a1.status = 'Approved' AND a1.vendor_id IS NOT NULL
                            ) a ON a.vendor_id = v.vendor_id
                            ORDER BY v.created_at DESC";

    $result = $conn->query($query);
    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }

    $businesses = [];
    while ($row = $result->fetch_assoc()) {
        $businesses[] = [
            'vendor_id' => (int)$row['vendor_id'],
            'business_name' => $row['business_name'],
            'owner_name' => $row['owner_name'],
            'email' => $row['email'],
            'contact_number' => $row['contact_number'],
            'address' => $row['address'],
            'estimated_time' => $row['estimated_time'],
            'location_detail' => $row['location_detail'],
            'profile_image' => $row['profile_image'] ?: 'default.png',
            'session_status' => $row['session_status'],
            'date_created' => date('M d, Y', strtotime($row['created_at']))
        ];
    }

    http_response_code(200);
    echo json_encode(['status' => 'success', 'data' => $businesses]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
