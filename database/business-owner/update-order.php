<?php
session_start();
require_once '../connectDB.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$action = $_POST['action'] ?? '';
$order_id = intval($_POST['order_id'] ?? 0);
$vendor_id = $_SESSION['vendor_id'] ?? 1; // Default to 1 for demo

switch ($action) {
    case 'get_order_details':
        $sql = "SELECT o.*, c.NAME AS customer_name, c.contact_number, c.email,
                       v.business_name
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                JOIN vendors v ON o.vendor_id = v.vendor_id
                WHERE o.order_id = ? AND o.vendor_id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $order_id, $vendor_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            // Get order items if the table exists
            $items = [];
            try {
                $items_sql = "SELECT oi.*, p.image 
                             FROM order_items oi
                             LEFT JOIN products p ON oi.product_id = p.product_id
                             WHERE oi.order_id = ?";
                $items_stmt = $conn->prepare($items_sql);
                $items_stmt->bind_param("i", $order_id);
                $items_stmt->execute();
                $items_result = $items_stmt->get_result();
                $items = $items_result->fetch_all(MYSQLI_ASSOC);
            } catch (Exception $e) {
                // Use sample items if table doesn't exist
                $items = [
                    [
                        'product_name' => '1-pc. Chickenjoy w/ Jolly Spaghetti Solo',
                        'quantity' => 3,
                        'price_at_time' => 164.00
                    ],
                    [
                        'product_name' => 'Palabok Solo',
                        'quantity' => 1,
                        'price_at_time' => 141.00
                    ]
                ];
            }
            
            echo json_encode([
                'success' => true,
                'order' => $row,
                'items' => $items
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
        }
        break;
        
    case 'update_status':
        $new_status = $_POST['status'] ?? '';
        $allowed_statuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
        
        if (!in_array($new_status, $allowed_statuses)) {
            echo json_encode(['success' => false, 'message' => 'Invalid status']);
            exit;
        }
        
        $sql = "UPDATE orders SET order_status = ? WHERE order_id = ? AND vendor_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sii", $new_status, $order_id, $vendor_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true, 
                'message' => 'Order status updated to ' . $new_status,
                'new_status' => $new_status
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update status']);
        }
        break;
        
    case 'cancel_order':
        $reason = $_POST['reason'] ?? '';
        
        $sql = "UPDATE orders SET order_status = 'Cancelled', rejection_reason = ? 
                WHERE order_id = ? AND vendor_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sii", $reason, $order_id, $vendor_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Order cancelled successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to cancel order']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}
?>