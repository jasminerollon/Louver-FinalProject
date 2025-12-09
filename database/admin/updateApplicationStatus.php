<?php
session_start();
header('Content-Type: application/json');

require_once '../../database/connectDB.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['application_id']) || !isset($input['status'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
    exit;
}

$application_id = $input['application_id'];
$status = $input['status'];
$rejection_reason = $input['rejection_reason'] ?? null;

try {
    if ($status === 'Rejected') {
        $query = "UPDATE applications SET status = ?, rejection_reason = ? WHERE application_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sss", $status, $rejection_reason, $application_id);
    } else {
        $query = "UPDATE applications SET status = ?, rejection_reason = NULL WHERE application_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $status, $application_id);
    }

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    echo json_encode(['status' => 'success']);
    $stmt->close();

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
