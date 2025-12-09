<?php
session_start();
header('Content-Type: application/json');

require_once '../../database/connectDB.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $temp = isset($_POST['temp_password']) ? trim($_POST['temp_password']) : '';
    if ($email === '' || $temp === '') {
        throw new Exception('Missing email or temporary password');
    }

    $stmt = $conn->prepare("SELECT application_id, status, rejection_reason FROM applications WHERE email = ? AND temp_password = ? ORDER BY submitted_at DESC LIMIT 1");
    if (!$stmt) { throw new Exception('Prepare failed: ' . $conn->error); }
    $stmt->bind_param('ss', $email, $temp);
    $stmt->execute();
    $res = $stmt->get_result();

    if (!$res || $res->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Application not found']);
        exit;
    }

    $row = $res->fetch_assoc();
    $stmt->close();

    http_response_code(200);
    echo json_encode(['status' => 'success', 'data' => [
        'application_id' => $row['application_id'],
        'status' => $row['status'],
        'rejection_reason' => $row['rejection_reason']
    ]]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>