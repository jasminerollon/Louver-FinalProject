<?php
session_start();

// Include database connection
$root = $_SERVER['DOCUMENT_ROOT'] . '/Louver/';

// Try multiple possible paths for the database connection
$possiblePaths = [
    $root . 'database/connectDB.php',
    dirname(__DIR__, 2) . '/database/connectDB.php',
    'C:/wamp64/www/Louver/database/connectDB.php'
];

$conn = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        break;
    }
}

// If connection failed, use sample data
$databaseConnected = isset($conn) && $conn;

// Check if vendor is logged in - for demo, use vendor_id = 1 (Jollikod)
if (!isset($_SESSION['vendor_id'])) {
    $_SESSION['vendor_id'] = 1; // Default to Jollikod for testing
}

$vendor_id = $_SESSION['vendor_id'];
$orders = [];
$order_issues = [];

// Handle POST actions (Cancel/Report/Update Status)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'cancel_order' && $databaseConnected) {
        $order_id = intval($_POST['order_id'] ?? 0);
        $reason = $_POST['reason'] ?? '';
        
        if ($order_id > 0 && !empty($reason)) {
            // Start transaction
            $conn->begin_transaction();
            
            try {
                // 1. Update the order status to Rejected
                $update_sql = "UPDATE orders SET order_status = 'Rejected', rejection_reason = ? 
                              WHERE order_id = ? AND vendor_id = ?";
                $stmt = $conn->prepare($update_sql);
                $stmt->bind_param("sii", $reason, $order_id, $vendor_id);
                
                if (!$stmt->execute()) {
                    throw new Exception("Failed to update order status");
                }
                
                // 2. Create a record in order_issues table for tracking
                $issue_sql = "INSERT INTO order_issues (order_id, vendor_id, issue_reason, description, status) 
                             VALUES (?, ?, 'Rejected order appeal', ?, 'Reviewed')";
                $issue_stmt = $conn->prepare($issue_sql);
                $issue_desc = "Vendor cancelled order. Reason: " . $reason;
                $issue_stmt->bind_param("iis", $order_id, $vendor_id, $issue_desc);
                
                if (!$issue_stmt->execute()) {
                    throw new Exception("Failed to create order issue record");
                }
                
                $conn->commit();
                $cancel_success = "Order #$order_id cancelled successfully and reported.";
                
            } catch (Exception $e) {
                $conn->rollback();
                $cancel_error = "Failed to cancel order: " . $e->getMessage();
            }
        }
    }
    
    if ($action === 'report_order' && $databaseConnected) {
        $order_id = intval($_POST['order_id'] ?? 0);
        $category = $_POST['category'] ?? '';
        $description = $_POST['description'] ?? '';
        
        if ($order_id > 0 && !empty($category) && !empty($description)) {
            // Check if order belongs to this vendor
            $check_sql = "SELECT order_id FROM orders WHERE order_id = ? AND vendor_id = ?";
            $check_stmt = $conn->prepare($check_sql);
            $check_stmt->bind_param("ii", $order_id, $vendor_id);
            $check_stmt->execute();
            $check_result = $check_stmt->get_result();
            
            if ($check_result->num_rows > 0) {
                // Insert into order_issues table
                $report_sql = "INSERT INTO order_issues (order_id, vendor_id, issue_reason, description, status) 
                              VALUES (?, ?, ?, ?, 'Pending')";
                $stmt = $conn->prepare($report_sql);
                $stmt->bind_param("iiss", $order_id, $vendor_id, $category, $description);
                
                if ($stmt->execute()) {
                    $report_success = "Order #$order_id reported successfully.";
                } else {
                    $report_error = "Failed to report order.";
                }
            } else {
                $report_error = "Order not found or doesn't belong to your business.";
            }
        }
    }
    
    // Handle status update
    if ($action === 'update_status' && $databaseConnected) {
        $order_id = intval($_POST['order_id'] ?? 0);
        $new_status = $_POST['status'] ?? '';
        
        if ($order_id > 0 && !empty($new_status)) {
            $update_sql = "UPDATE orders SET order_status = ? WHERE order_id = ? AND vendor_id = ?";
            $stmt = $conn->prepare($update_sql);
            $stmt->bind_param("sii", $new_status, $order_id, $vendor_id);
            
            if ($stmt->execute()) {
                // If status changed to Rejected, also create an order_issue
                if ($new_status === 'Rejected') {
                    $reason = "Vendor changed order status to Rejected";
                    $issue_sql = "INSERT INTO order_issues (order_id, vendor_id, issue_reason, description, status) 
                                 VALUES (?, ?, 'Rejected order appeal', ?, 'Reviewed')";
                    $issue_stmt = $conn->prepare($issue_sql);
                    $issue_stmt->bind_param("iis", $order_id, $vendor_id, $reason);
                    $issue_stmt->execute();
                }
                
                $status_success = "Order #$order_id status updated to $new_status.";
            } else {
                $status_error = "Failed to update order status.";
            }
        }
    }
}

if ($databaseConnected) {
    // Fetch orders for this vendor with their items
    $sql = "SELECT o.order_id, o.total_price, o.order_status, o.created_at, o.rejection_reason,
            c.customer_id, c.NAME AS customer_name, c.contact_number, c.email,
            v.business_name
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            JOIN vendors v ON o.vendor_id = v.vendor_id
            WHERE o.vendor_id = ?
            ORDER BY o.created_at DESC";
            
    try {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $vendor_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result) {
            $orders = $result->fetch_all(MYSQLI_ASSOC);
            
            // Fetch order items for each order
            foreach ($orders as &$order) {
                $order_id = $order['order_id'];
                $items_sql = "SELECT oi.*, p.image, p.NAME as product_name_full
                             FROM order_items oi
                             LEFT JOIN products p ON oi.product_id = p.product_id
                             WHERE oi.order_id = ?";
                
                $items_stmt = $conn->prepare($items_sql);
                $items_stmt->bind_param("i", $order_id);
                $items_stmt->execute();
                $items_result = $items_stmt->get_result();
                
                $order['items'] = $items_result->fetch_all(MYSQLI_ASSOC);
                $items_stmt->close();
                
                // Fetch any order issues for this order
                $issues_sql = "SELECT * FROM order_issues WHERE order_id = ? AND vendor_id = ?";
                $issues_stmt = $conn->prepare($issues_sql);
                $issues_stmt->bind_param("ii", $order_id, $vendor_id);
                $issues_stmt->execute();
                $issues_result = $issues_stmt->get_result();
                $order['issues'] = $issues_result->fetch_all(MYSQLI_ASSOC);
                $issues_stmt->close();
            }
            unset($order); // Break the reference
            
            // Also fetch all order_issues for refunds tab
            $issues_sql = "SELECT oi.*, o.order_id, o.total_price, c.NAME AS customer_name,
                          v.business_name, o.created_at
                          FROM order_issues oi
                          JOIN orders o ON oi.order_id = o.order_id
                          JOIN customers c ON o.customer_id = c.customer_id
                          JOIN vendors v ON o.vendor_id = v.vendor_id
                          WHERE o.vendor_id = ?
                          ORDER BY oi.created_at DESC";
            
            $issues_stmt = $conn->prepare($issues_sql);
            $issues_stmt->bind_param("i", $vendor_id);
            $issues_stmt->execute();
            $issues_result = $issues_stmt->get_result();
            $order_issues = $issues_result->fetch_all(MYSQLI_ASSOC);
            
        }
    } catch (Exception $e) {
        error_log("Database error: " . $e->getMessage());
        // Fallback to sample data if database fails
        $orders = [];
        $order_issues = [];
    }
}

// If no orders from database, use sample data
if (empty($orders)) {
    $orders = [
        [
            'order_id' => 7,
            'customer_id' => 1,
            'total_price' => 328,
            'order_status' => 'Preparing',
            'created_at' => '2025-12-08 19:06:26',
            'rejection_reason' => null,
            'customer_name' => 'Heart Bhea J. Conserva',
            'contact_number' => '09123456789',
            'email' => 'heartconserva@gmail.com',
            'business_name' => 'Jollikod',
            'items' => [
                [
                    'product_name' => '1 - pc. Chickenjoy w/ Jolly Spaghetti Solo',
                    'quantity' => 2,
                    'price_at_time' => 164.00
                ]
            ],
            'issues' => [
                [
                    'issue_id' => 4,
                    'issue_reason' => 'Wrong item delivered',
                    'description' => 'Customer received incorrect product.',
                    'status' => 'Pending'
                ]
            ]
        ],
        [
            'order_id' => 1,
            'customer_id' => 2,
            'total_price' => 313.00,
            'order_status' => 'Delivered',
            'created_at' => '2025-10-16 10:15:00',
            'rejection_reason' => null,
            'customer_name' => 'Niña Aida B. Padua',
            'contact_number' => '09911132114',
            'email' => 'ninapadua@gmail.com',
            'business_name' => 'Jollikod',
            'items' => [
                [
                    'product_name' => '1 - pc. Chickenjoy w/ Jolly Spaghetti Solo',
                    'quantity' => 1,
                    'price_at_time' => 164.00
                ],
                [
                    'product_name' => '2 - pc. Burger Steak Solo',
                    'quantity' => 1,
                    'price_at_time' => 149.00
                ]
            ],
            'issues' => [
                [
                    'issue_id' => 1,
                    'issue_reason' => 'Damaged product',
                    'description' => 'Customer reported item arrived broken.',
                    'status' => 'Resolved'
                ]
            ]
        ],
        [
            'order_id' => 5,
            'customer_id' => 2,
            'total_price' => 255.00,
            'order_status' => 'Rejected',
            'created_at' => '2025-11-26 14:30:00',
            'rejection_reason' => 'Vendor documents incomplete',
            'customer_name' => 'Niña Aida B. Padua',
            'contact_number' => '09911132114',
            'email' => 'ninapadua@gmail.com',
            'business_name' => 'Jollikod',
            'items' => [
                [
                    'product_name' => 'Signature Mayo Latte',
                    'quantity' => 1,
                    'price_at_time' => 135.00
                ],
                [
                    'product_name' => 'Brown Sugar Milk Tea',
                    'quantity' => 1,
                    'price_at_time' => 120.00
                ]
            ],
            'issues' => [
                [
                    'issue_id' => 3,
                    'issue_reason' => 'Rejected order appeal',
                    'description' => 'Customer appealing rejection of order.',
                    'status' => 'Reviewed'
                ]
            ]
        ]
    ];
}

// Get order details for modal if order_id is specified
$modalOrder = null;
if (isset($_GET['view_order']) && !empty($orders)) {
    $view_order_id = intval($_GET['view_order']);
    foreach ($orders as $order) {
        if ($order['order_id'] == $view_order_id) {
            $modalOrder = $order;
            break;
        }
    }
    
    // Calculate subtotal and delivery fee for modal order
    if ($modalOrder) {
        $subtotal = 0;
        if (isset($modalOrder['items']) && !empty($modalOrder['items'])) {
            foreach ($modalOrder['items'] as $item) {
                $subtotal += ($item['price_at_time'] * $item['quantity']);
            }
        } else {
            $subtotal = $modalOrder['total_price'] - 20;
        }
        $modalOrder['subtotal'] = $subtotal;
        $modalOrder['delivery_fee'] = 20; // Fixed delivery fee
    }
}

// Calculate totals for each order in table
foreach ($orders as &$order) {
    $subtotal = 0;
    if (isset($order['items']) && !empty($order['items'])) {
        foreach ($order['items'] as $item) {
            $subtotal += ($item['price_at_time'] * $item['quantity']);
        }
    } else {
        $subtotal = $order['total_price'] - 20;
    }
    $order['subtotal'] = $subtotal;
    $order['delivery_fee'] = 20;
    
    // Count items
    $order['item_count'] = 0;
    if (isset($order['items']) && !empty($order['items'])) {
        foreach ($order['items'] as $item) {
            $order['item_count'] += $item['quantity'];
        }
    }
}
unset($order);

// Prepare orders data for JavaScript
$ordersDataForJS = [];
foreach ($orders as $order) {
    $orderData = [
        'order_id' => $order['order_id'],
        'customer_name' => $order['customer_name'],
        'contact_number' => $order['contact_number'] ?? '',
        'email' => $order['email'] ?? '',
        'total_price' => $order['total_price'],
        'order_status' => $order['order_status'],
        'created_at' => $order['created_at'],
        'business_name' => $order['business_name'],
        'subtotal' => $order['subtotal'],
        'delivery_fee' => $order['delivery_fee'],
        'item_count' => $order['item_count'] ?? 0,
        'items' => $order['items'] ?? [],
        'issues' => $order['issues'] ?? []
    ];
    
    $ordersDataForJS[] = $orderData;
}

// Prepare order issues data for JavaScript
$orderIssuesForJS = [];
foreach ($order_issues as $issue) {
    $issueData = [
        'order_id' => $issue['order_id'],
        'issue_id' => $issue['issue_id'],
        'issue_reason' => $issue['issue_reason'],
        'description' => $issue['description'],
        'status' => $issue['status'],
        'customer_name' => $issue['customer_name'] ?? '',
        'total_price' => $issue['total_price'] ?? 0,
        'business_name' => $issue['business_name'] ?? '',
        'created_at' => $issue['created_at'] ?? ''
    ];
    
    $orderIssuesForJS[] = $issueData;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Orders | Louver</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<link rel="stylesheet" href="../../css/business-owner/business-owner-style.css">
<link rel="stylesheet" href="../../css/business-owner/business-owner-myorders.css">

<style>
/* Custom status select styles - keep this inline for dynamic updates */
.status-select {
    padding: 6px 30px 6px 12px;
    border-radius: 20px;
    border: 2px solid #ddd;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    min-width: 130px;
    outline: none;
    transition: all 0.3s ease;
    background-color: white;
    color: #333;
    position: relative;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23760101' width='18px' height='18px'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 18px;
}

.status-select:focus {
    border-color: #8B0000;
    box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

/* FIXED: Status-specific styles for the select itself - each status gets its own class */
.status-select.pending {
    border-color: #FFA500;
    background-color: #FFF3E0;
    color: #E65100;
}

.status-select.preparing {
    border-color: #2196F3;
    background-color: #E3F2FD;
    color: #0D47A1;
}

.status-select.ready {
    border-color: #4CAF50;
    background-color: #E8F5E9;
    color: #1B5E20;
}

.status-select.delivered {
    border-color: #9C27B0;
    background-color: #F3E5F5;
    color: #4A148C;
}

.status-select.rejected {
    border-color: #F44336;
    background-color: #FFEBEE;
    color: #B71C1C;
}

/* Sort dropdown fix */
.sort-dropdown {
    position: relative;
    z-index: 1000;
}

.sort-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 5px;
    background: white;
    border-radius: 12px;
    padding: 8px 0;
    list-style: none;
    box-shadow: 0 5px 22px rgba(0,0,0,0.2);
    display: none;
    z-index: 1001;
    min-width: 180px;
}

.sort-options.active {
    display: block;
}

/* Make sure sort button is properly sized */
.sort-btn {
    min-width: 180px;
    justify-content: space-between;
}

/* Ensure avatar colors are dynamic */
.avatar {
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
}

/* Refunds table specific styles */
.refunds-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    display: none;
}

.refunds-table.active {
    display: table;
}

.refunds-table th {
    background-color: #8B0000;
    color: white;
    padding: 15px;
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 14px;
}

.refunds-table td {
    padding: 15px;
    border-bottom: 1px solid #eee;
    color: #333;
}

.refunds-table tr:hover {
    background-color: #f9f9f9;
}

.issue-status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    display: inline-block;
    min-width: 80px;
    text-align: center;
}

.issue-status.pending {
    background-color: #FFF3CD;
    color: #856404;
}

.issue-status.reviewed {
    background-color: #D1ECF1;
    color: #0C5460;
}

.issue-status.resolved {
    background-color: #D4EDDA;
    color: #155724;
}

/* Order note with issue info */
.issue-note {
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 8px;
    border-left: 4px solid #8B0000;
    margin-top: 10px;
    font-size: 14px;
}

.issue-note strong {
    color: #8B0000;
}

/* Make sure the tables are properly shown/hidden */
.orders-table-wrapper table {
    width: 100%;
    border-collapse: collapse;
}

#ordersTable {
    display: table;
}

#refundsTable {
    display: none;
}

/* Live clock styling */
.date-label {
    font-weight: 500;
    font-size: 14px;
    color: #333;
    background-color: #f8f9fa;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    min-width: 200px;
    text-align: center;
}

/* Status badges for modal */
.status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    display: inline-block;
    margin-left: 10px;
}

.status.pending {
    background-color: #FFF3E0;
    color: #E65100;
    border: 2px solid #FFA500;
}

.status.preparing {
    background-color: #E3F2FD;
    color: #0D47A1;
    border: 2px solid #2196F3;
}

.status.ready {
    background-color: #E8F5E9;
    color: #1B5E20;
    border: 2px solid #4CAF50;
}

.status.delivered {
    background-color: #F3E5F5;
    color: #4A148C;
    border: 2px solid #9C27B0;
}

.status.failed {
    background-color: #FFEBEE;
    color: #B71C1C;
    border: 2px solid #F44336;
}

.status.rejected {
    background-color: #FFEBEE;
    color: #B71C1C;
    border: 2px solid #F44336;
}
</style>
</head>

<body>

<!-- NAVBAR -->
<div class="navbar">
    <div class="logo">
        <img src="../../assets/pictures/logo.png" alt="Louver Logo" style="height:60px; width:auto;" />
        <span>LOUVER</span>
    </div>

    <div class="navbar-right">
        <nav>
            <a href="business-owner-products.html">PRODUCTS</a>
            <a href="business-owner-myorders.php" class="active">ORDERS</a>
            <a href="business-owner-account.html">PROFILE</a>
        </nav>
    </div>
</div>

<div class="orders-container">

    <!-- Success/Error Messages -->
    <?php if (isset($cancel_success)): ?>
    <div class="notification success"><?php echo htmlspecialchars($cancel_success); ?></div>
    <?php endif; ?>
    
    <?php if (isset($cancel_error)): ?>
    <div class="notification error"><?php echo htmlspecialchars($cancel_error); ?></div>
    <?php endif; ?>
    
    <?php if (isset($report_success)): ?>
    <div class="notification success"><?php echo htmlspecialchars($report_success); ?></div>
    <?php endif; ?>
    
    <?php if (isset($report_error)): ?>
    <div class="notification error"><?php echo htmlspecialchars($report_error); ?></div>
    <?php endif; ?>
    
    <?php if (isset($status_success)): ?>
    <div class="notification success"><?php echo htmlspecialchars($status_success); ?></div>
    <?php endif; ?>
    
    <?php if (isset($status_error)): ?>
    <div class="notification error"><?php echo htmlspecialchars($status_error); ?></div>
    <?php endif; ?>

    <!-- Top Bar -->
    <div class="orders-top">
      <div class="search-wrapper">
        <i class="fa fa-search"></i>
        <input type="text" id="searchInput" placeholder="Search order ID">
      </div>

      <div class="date-sort">
        <div class="sort-dropdown">
          <button class="sort-btn">Sort by: <span id="sort-value">Relevance</span> <i class="fa fa-caret-down"></i></button>
          <ul class="sort-options">
            <li class="label">Sort by:</li>
            <li data-sort="relevance" class="active">Relevance</li>
            <li data-sort="newest">Newest</li>
            <li data-sort="oldest">Oldest</li>
            <li data-sort="total-high">Total: High to Low</li>
            <li data-sort="total-low">Total: Low to High</li>
          </ul>
        </div>
        <p class="date-label" id="liveClock"><?php echo date('F d, Y | h:i:s A'); ?></p>
      </div>
    </div>

    <!-- Tabs - Changed "REFUNDS & REPORTS" to "REFUNDS" -->
    <div class="orders-tabs">
        <button class="tab active" data-tab="orders">ORDERS</button>
        <button class="tab" data-tab="refunds">REFUNDS</button>
    </div>

    <!-- Tables Container -->
    <div class="orders-table-wrapper">
      <!-- Orders Table -->
      <table class="orders-table" id="ordersTable">
        <thead>
          <tr>
            <th>ORDER ID</th>
            <th>DATE</th>
            <th>CUSTOMER</th>
            <th>BUSINESS</th>
            <th>TOTAL</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody id="ordersTableBody">
          <?php foreach ($orders as $order): ?>
          <?php 
          // Map database status to CSS class
          $status_class = strtolower($order['order_status']);
          $status_display = $order['order_status'];
          
          // Ensure status matches CSS classes
          if ($status_class == 'rejected') {
              $status_display = 'Cancelled';
          }
          
          // Format date exactly as requested: "Nov 03, 2025 | 08:45 PM"
          $date = new DateTime($order['created_at']);
          $formatted_date = $date->format('M d, Y | h:i A');
          ?>
          <tr data-tab="orders" data-order-id="<?php echo $order['order_id']; ?>">
              <td><?php echo htmlspecialchars($order['order_id']); ?></td>
              <td class="date-cell"><?php echo $formatted_date; ?></td>
              <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
              <td><?php echo htmlspecialchars($order['business_name']); ?></td>
              <td>₱ <?php echo number_format($order['total_price'], 2); ?></td>
              <td>
                  <form method="POST" class="status-form" style="display: inline;">
                      <input type="hidden" name="action" value="update_status">
                      <input type="hidden" name="order_id" value="<?php echo $order['order_id']; ?>">
                      <select name="status" class="status-select <?php echo $status_class; ?>" onchange="updateStatusColor(this); this.form.submit();" data-order-id="<?php echo $order['order_id']; ?>">
                          <option value="Pending" <?php echo $order['order_status'] == 'Pending' ? 'selected' : ''; ?>>Pending</option>
                          <option value="Preparing" <?php echo $order['order_status'] == 'Preparing' ? 'selected' : ''; ?>>Preparing</option>
                          <option value="Ready" <?php echo $order['order_status'] == 'Ready' ? 'selected' : ''; ?>>Ready</option>
                          <option value="Delivered" <?php echo $order['order_status'] == 'Delivered' ? 'selected' : ''; ?>>Delivered</option>
                          <option value="Rejected" <?php echo $order['order_status'] == 'Rejected' ? 'selected' : ''; ?>>Cancelled</option>
                      </select>
                  </form>
              </td>
              <td><a href="?view_order=<?php echo $order['order_id']; ?>" class="view-btn"><i class="fa fa-eye"></i> View</a></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
      
      <!-- Refunds Table (Initially hidden) -->
      <table class="refunds-table" id="refundsTable">
        <thead>
          <tr>
            <th>ORDER ID</th>
            <th>DATE</th>
            <th>CUSTOMER</th>
            <th>ISSUE TYPE</th>
            <th>DESCRIPTION</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody id="refundsTableBody">
          <?php foreach ($order_issues as $issue): ?>
          <?php 
          $issue_date = new DateTime($issue['created_at']);
          $formatted_issue_date = $issue_date->format('M d, Y | h:i A');
          $issue_status_class = strtolower($issue['status'] ?? 'pending');
          ?>
          <tr data-tab="refunds" data-order-id="<?php echo $issue['order_id']; ?>">
              <td><?php echo htmlspecialchars($issue['order_id']); ?></td>
              <td><?php echo $formatted_issue_date; ?></td>
              <td><?php echo htmlspecialchars($issue['customer_name'] ?? 'Unknown'); ?></td>
              <td><?php echo htmlspecialchars($issue['issue_reason']); ?></td>
              <td><?php echo htmlspecialchars(substr($issue['description'] ?? '', 0, 50)) . '...'; ?></td>
              <td><span class="issue-status <?php echo $issue_status_class; ?>"><?php echo ucfirst($issue_status_class); ?></span></td>
              <td><a href="?view_order=<?php echo $issue['order_id']; ?>" class="view-btn"><i class="fa fa-eye"></i> View</a></td>
          </tr>
          <?php endforeach; ?>
          
          <?php if (empty($order_issues)): ?>
          <tr>
              <td colspan="7" style="text-align: center; padding: 40px;">No refunds or reported issues found.</td>
          </tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>

</div>

<!-- MAIN ORDER DETAILS MODAL -->
<?php if ($modalOrder): ?>
<div class="modal-overlay <?php echo $modalOrder ? 'active' : ''; ?>" id="orderModal">
  <div class="modal">

    <button class="close-btn" onclick="closeModal()">&times;</button>

    <h1 class="order-title">Order <span id="modalOrderId"><?php echo $modalOrder['order_id']; ?></span> 
        <span class="status <?php echo strtolower($modalOrder['order_status']); ?>">
            <?php echo $modalOrder['order_status'] == 'Rejected' ? 'Cancelled' : $modalOrder['order_status']; ?>
        </span>
    </h1>
    <p class="ordered-date" id="modalOrderDate">
        Ordered on: <?php 
            $modalDate = new DateTime($modalOrder['created_at']);
            echo $modalDate->format('M d, Y | h:i A'); 
        ?>
    </p>

    <div class="modal-content">

      <!-- LEFT SECTION -->
      <div class="left-section">
        <div class="profile">
          <div class="avatar" id="modalAvatar" style="background-color: <?php echo getRandomColor($modalOrder['customer_name']); ?>;">
            <?php echo getInitials($modalOrder['customer_name']); ?>
          </div>
          <h3 id="modalCustomerName"><?php echo htmlspecialchars($modalOrder['customer_name']); ?></h3>
        </div>

        <div class="contact-info">
          <p><strong>Contact Info</strong></p>
          <p id="modalContactNumber"><?php echo htmlspecialchars($modalOrder['contact_number'] ?? 'Not provided'); ?></p>
          <p id="modalEmail"><?php echo htmlspecialchars($modalOrder['email'] ?? 'Not provided'); ?></p>
        </div>

        <div class="order-note">
          <p><strong>Order Note</strong></p>
          <p id="modalOrderNote"><?php echo htmlspecialchars($modalOrder['rejection_reason'] ?? 'No special instructions'); ?></p>
          
          <?php if (!empty($modalOrder['issues'])): ?>
          <div class="issue-note">
            <p><strong>Issue Reported:</strong> <?php echo htmlspecialchars($modalOrder['issues'][0]['issue_reason'] ?? ''); ?></p>
            <p><small><?php echo htmlspecialchars(substr($modalOrder['issues'][0]['description'] ?? '', 0, 100)); ?>...</small></p>
          </div>
          <?php endif; ?>
        </div>

        <button class="contact-user-btn" onclick="contactUser()">Contact User</button>
      </div>

      <!-- RIGHT SECTION -->
      <div class="right-section">

        <div class="section">
          <h3>Items</h3>
          <div id="modalItemsContainer">
            <?php 
            $item_count = 0;
            $subtotal = 0;
            if (isset($modalOrder['items']) && !empty($modalOrder['items'])): 
                foreach ($modalOrder['items'] as $item): 
                    $item_total = $item['price_at_time'] * $item['quantity'];
                    $subtotal += $item_total;
                    $item_count += $item['quantity'];
            ?>
            <div class="item">
              <span><?php echo $item['quantity']; ?>x <?php echo htmlspecialchars($item['product_name']); ?></span>
              <span class="item-price">₱ <?php echo number_format($item_total, 2); ?></span>
            </div>
            <?php endforeach; endif; ?>
          </div>
        </div>

        <div class="section">
          <h3>Payment Summary</h3>
          <div class="summary-row">
              <span>Subtotal (<span id="itemCount"><?php echo $item_count; ?></span> items)</span>
              <span id="modalSubtotal">₱ <?php echo number_format($subtotal, 2); ?></span>
          </div>
          <div class="summary-row">
              <span>Delivery</span>
              <span id="modalDelivery">₱ <?php echo number_format($modalOrder['delivery_fee'] ?? 20, 2); ?></span>
          </div>
          <hr />
          <div class="summary-row total">
              <span>TOTAL</span>
              <span id="modalTotal">₱ <?php echo number_format($modalOrder['total_price'], 2); ?></span>
          </div>
        </div>

        <div class="delivery-actions-row">
          <div class="delivery-box">
              <h3>Delivery Information</h3>
              <p><strong>Standard Delivery</strong></p>
              <p>Location: <span id="modalLocation">D502</span></p>
              <p>Date: <span id="modalDeliveryDate"><?php echo date('F j, Y', strtotime($modalOrder['created_at'])); ?></span></p>
              <p>Time: <span id="modalDeliveryTime"><?php echo date('h:i A', strtotime($modalOrder['created_at'])); ?></span></p>
          </div>

          <div class="action-buttons">
              <?php if ($modalOrder['order_status'] !== 'Rejected'): ?>
              <button class="report-btn" onclick="showReportModal(<?php echo $modalOrder['order_id']; ?>)">Report Order</button>
              <?php endif; ?>
              
              <?php if ($modalOrder['order_status'] !== 'Delivered' && $modalOrder['order_status'] !== 'Rejected'): ?>
              <button class="cancel-btn" onclick="showCancelModal(<?php echo $modalOrder['order_id']; ?>)">Cancel Order</button>
              <?php endif; ?>
          </div>
        </div>

      </div>

    </div>
  </div>
</div>
<?php endif; ?>

<!-- REPORT ORDER MODAL -->
<div class="report-modal-overlay" id="reportModal">
  <div class="report-modal">
      <form method="POST" enctype="multipart/form-data">
          <button type="button" class="report-close-btn" onclick="closeReportModal()">&times;</button>

          <h2 class="report-title">Report Order</h2>
          
          <input type="hidden" name="action" value="report_order">
          <input type="hidden" name="order_id" id="reportOrderId">

          <div class="report-section">
              <label>Category</label>
              <div class="custom-select">
                  <select name="category" id="reportCategory" required>
                      <option value="">Select a category</option>
                      <option value="Did not receive products">Did not receive products</option>
                      <option value="Wrong item delivered">Wrong item delivered</option>
                      <option value="Damaged product">Damaged product</option>
                      <option value="Late delivery">Late delivery</option>
                      <option value="Incomplete order">Incomplete order</option>
                      <option value="Rejected order appeal">Rejected order appeal</option>
                      <option value="Payment issue">Payment issue</option>
                      <option value="Other">Other</option>
                  </select>
                  <i class="fa-solid fa-caret-down"></i>
              </div>
          </div>

          <div class="report-section">
            <label>Proof (Optional)</label>
            <div class="upload-box" onclick="document.getElementById('fileInput').click()">
                <i class="fa-solid fa-image"></i>
                <p id="uploadText">Upload screenshots, photos, or videos</p>
            </div>
            <input type="file" name="proof" id="fileInput" style="display:none;" accept="image/*,video/*" onchange="updateFileName()">
          </div>

          <div class="report-section">
              <label>Additional Information</label>
              <textarea name="description" id="reportDescription" placeholder="Type here" required></textarea>
          </div>

          <div class="report-buttons">
              <button type="submit" class="confirm-report">CONFIRM</button>
              <button type="button" class="cancel-report" onclick="closeReportModal()">CANCEL</button>
          </div>
      </form>
  </div>
</div>

<!-- CANCEL ORDER MODAL -->
<div class="cancel-modal-overlay" id="cancelOrderModal">
    <div class="cancel-modal">
        <form method="POST">
            <h2 class="cancel-title">Cancel Order</h2>
            <p class="cancel-subtitle">Are you sure you want to<br><strong id="cancelOrderText">cancel Order?</strong></p>
            
            <input type="hidden" name="action" value="cancel_order">
            <input type="hidden" name="order_id" id="cancelOrderId">

            <label class="cancel-label">Reason of cancellation</label>

            <div class="cancel-textarea-wrapper">
                <textarea name="reason" class="cancel-textarea" id="cancelReason" placeholder="Type reason here" required></textarea>
            </div>

            <div class="cancel-buttons">
                <button type="submit" class="cancel-confirm-btn">CONFIRM</button>
                <button type="button" class="cancel-cancel-btn" onclick="closeCancelModal()">CANCEL</button>
            </div>
        </form>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<<<<<<< HEAD
=======
<script src="../../js/business-owner/business-owner-myorders.js"></script>
<script src="../../js/business-owner/business-owner-sort.js"></script>
>>>>>>> e792255648f79b16f8d5d583362fea594efa964b
<script>
// Pass PHP data to JavaScript
const ordersData = <?php echo json_encode($ordersDataForJS); ?>;
const orderIssuesData = <?php echo json_encode($orderIssuesForJS); ?>;
const vendorId = <?php echo $vendor_id; ?>;

console.log('Orders loaded:', ordersData);
console.log('Order issues loaded:', orderIssuesData);

// Live Clock Function
function updateLiveClock() {
    const now = new Date();
    
    // Format the date: "December 09, 2024 | 03:45:15 PM"
    const options = { 
        month: 'long', 
        day: '2-digit', 
        year: 'numeric' 
    };
    const datePart = now.toLocaleDateString('en-US', options);
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    // Add leading zeros
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    const timePart = `${hours}:${minutes}:${seconds} ${ampm}`;
    
    // Update the clock element
    const clockElement = document.getElementById('liveClock');
    if (clockElement) {
        clockElement.textContent = `${datePart} | ${timePart}`;
    }
}

// Initialize the clock and update every second
updateLiveClock();
setInterval(updateLiveClock, 1000);

// Function to update status color when changed
function updateStatusColor(selectElement) {
    const value = selectElement.value.toLowerCase();
    
    // Remove all existing status classes
    selectElement.classList.remove('pending', 'preparing', 'ready', 'delivered', 'rejected');
    
    // Add the appropriate class based on selected value
    if (value === 'pending') {
        selectElement.classList.add('pending');
    } else if (value === 'preparing') {
        selectElement.classList.add('preparing');
    } else if (value === 'ready') {
        selectElement.classList.add('ready');
    } else if (value === 'delivered') {
        selectElement.classList.add('delivered');
    } else if (value === 'rejected') {
        selectElement.classList.add('rejected');
    }
}

// Modal functions
function closeModal() {
    window.location.href = 'business-owner-myorders.php';
}

function showReportModal(orderId) {
    document.getElementById('reportOrderId').value = orderId;
    document.getElementById('reportModal').style.display = 'flex';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    document.getElementById('reportCategory').selectedIndex = 0;
    document.getElementById('reportDescription').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadText').textContent = 'Upload screenshots, photos, or videos';
}

function showCancelModal(orderId) {
    document.getElementById('cancelOrderId').value = orderId;
    document.getElementById('cancelOrderText').innerHTML = `cancel Order ${orderId}?`;
    document.getElementById('cancelOrderModal').classList.add('active');
}

function closeCancelModal() {
    document.getElementById('cancelOrderModal').classList.remove('active');
    document.getElementById('cancelReason').value = '';
}

function updateFileName() {
    const fileInput = document.getElementById('fileInput');
    const uploadText = document.getElementById('uploadText');
    if (fileInput.files.length > 0) {
        uploadText.textContent = fileInput.files[0].name;
    }
}

function contactUser() {
    const phone = document.getElementById('modalContactNumber').textContent;
    const email = document.getElementById('modalEmail').textContent;
    
    if (phone === 'Not provided' && email === 'Not provided') {
        Swal.fire("No Contact Info", "Customer has not provided contact information.", "info");
        return;
    }
    
    let html = '<div style="text-align: left; padding: 10px;">';
    if (phone !== 'Not provided') {
        html += `<p><strong>Phone:</strong> ${phone}</p>`;
    }
    if (email !== 'Not provided') {
        html += `<p><strong>Email:</strong> ${email}</p>`;
    }
    html += '</div>';
    
    Swal.fire({
        title: "Contact Information",
        html: html,
        showCloseButton: true,
        showConfirmButton: false
    });
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    
    if (activeTab === 'orders') {
        const rows = document.querySelectorAll('#ordersTableBody tr');
        rows.forEach(row => {
            const orderId = row.querySelector('td:first-child').textContent;
            const customerName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            
            if (orderId.includes(searchTerm) || customerName.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    } else {
        const rows = document.querySelectorAll('#refundsTableBody tr');
        rows.forEach(row => {
            const orderId = row.querySelector('td:first-child').textContent;
            const customerName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            const issueType = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            
            if (orderId.includes(searchTerm) || customerName.includes(searchTerm) || issueType.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
});

// Tab functionality - Show the appropriate table
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        const tabType = this.dataset.tab;
        
        // Show/hide tables
        if (tabType === 'orders') {
            document.getElementById('ordersTable').style.display = 'table';
            document.getElementById('refundsTable').style.display = 'none';
            document.getElementById('searchInput').placeholder = 'Search order ID';
        } else {
            document.getElementById('ordersTable').style.display = 'none';
            document.getElementById('refundsTable').style.display = 'table';
            document.getElementById('searchInput').placeholder = 'Search order ID or issue type';
        }
    });
});

// Sort functionality
const sortBtn = document.querySelector('.sort-btn');
const sortOptions = document.querySelector('.sort-options');
const sortValue = document.getElementById('sort-value');
const sortItems = document.querySelectorAll('.sort-options li:not(.label)');

// Toggle sort dropdown
sortBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    sortOptions.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!sortBtn.contains(e.target) && !sortOptions.contains(e.target)) {
        sortOptions.classList.remove('active');
    }
});

// Handle sort item selection
sortItems.forEach(item => {
    item.addEventListener('click', function() {
        const sortType = this.dataset.sort;
        
        // Update active state
        sortItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        // Update button text
        sortValue.textContent = this.textContent;
        
        // Close dropdown
        sortOptions.classList.remove('active');
        
        // Sort table based on active tab
        const activeTab = document.querySelector('.tab.active').dataset.tab;
        if (activeTab === 'orders') {
            sortOrdersTable(sortType);
        } else {
            sortRefundsTable(sortType);
        }
    });
});

function sortOrdersTable(sortBy) {
    const tbody = document.getElementById('ordersTableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        switch(sortBy) {
            case 'newest':
                const dateA = parseDateString(a.querySelector('td:nth-child(2)').textContent);
                const dateB = parseDateString(b.querySelector('td:nth-child(2)').textContent);
                return dateB - dateA;
                
            case 'oldest':
                const dateA2 = parseDateString(a.querySelector('td:nth-child(2)').textContent);
                const dateB2 = parseDateString(b.querySelector('td:nth-child(2)').textContent);
                return dateA2 - dateB2;
                
            case 'total-high':
                const totalA = parseFloat(a.querySelector('td:nth-child(5)').textContent.replace('₱ ', '').replace(',', ''));
                const totalB = parseFloat(b.querySelector('td:nth-child(5)').textContent.replace('₱ ', '').replace(',', ''));
                return totalB - totalA;
                
            case 'total-low':
                const totalA2 = parseFloat(a.querySelector('td:nth-child(5)').textContent.replace('₱ ', '').replace(',', ''));
                const totalB2 = parseFloat(b.querySelector('td:nth-child(5)').textContent.replace('₱ ', '').replace(',', ''));
                return totalA2 - totalB2;
                
            default: // relevance
                const idA = parseInt(a.querySelector('td:first-child').textContent);
                const idB = parseInt(b.querySelector('td:first-child').textContent);
                return idB - idA;
        }
    });
    
    // Reorder rows
    rows.forEach(row => tbody.appendChild(row));
}

function sortRefundsTable(sortBy) {
    const tbody = document.getElementById('refundsTableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        switch(sortBy) {
            case 'newest':
                const dateA = parseDateString(a.querySelector('td:nth-child(2)').textContent);
                const dateB = parseDateString(b.querySelector('td:nth-child(2)').textContent);
                return dateB - dateA;
                
            case 'oldest':
                const dateA2 = parseDateString(a.querySelector('td:nth-child(2)').textContent);
                const dateB2 = parseDateString(b.querySelector('td:nth-child(2)').textContent);
                return dateA2 - dateB2;
                
            default: // relevance
                const idA = parseInt(a.querySelector('td:first-child').textContent);
                const idB = parseInt(b.querySelector('td:first-child').textContent);
                return idB - idA;
        }
    });
    
    // Reorder rows
    rows.forEach(row => tbody.appendChild(row));
}

// Helper function to parse date strings
function parseDateString(dateStr) {
    const parts = dateStr.split('|');
    if (parts.length !== 2) return new Date(0);
    
    const datePart = parts[0].trim();
    const timePart = parts[1].trim();
    
    const monthAbbr = datePart.substring(0, 3);
    const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const dayMatch = datePart.match(/\s(\d+),/);
    const yearMatch = datePart.match(/(\d{4})$/);
    const timeMatch = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (!dayMatch || !yearMatch || !timeMatch || !monthMap[monthAbbr]) {
        return new Date(0);
    }
    
    const day = parseInt(dayMatch[1]);
    const year = parseInt(yearMatch[1]);
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const ampm = timeMatch[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) {
        hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return new Date(year, monthMap[monthAbbr], day, hours, minutes);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const reportModal = document.getElementById('reportModal');
    const cancelModal = document.getElementById('cancelOrderModal');
    
    if (event.target === reportModal) {
        closeReportModal();
    }
    if (event.target === cancelModal) {
        closeCancelModal();
    }
}

// Prevent form submission if validation fails
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';
            } else {
                field.style.borderColor = '';
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            Swal.fire("Error", "Please fill in all required fields.", "error");
        }
    });
});

// Initialize all status selects with correct colors on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Orders page loaded with real data');
    console.log('Number of orders:', ordersData.length);
    console.log('Number of order issues:', orderIssuesData.length);
    
    // Make sure only orders table is visible initially
    document.getElementById('ordersTable').style.display = 'table';
    document.getElementById('refundsTable').style.display = 'none';
    
    // Initialize all status select colors
    document.querySelectorAll('.status-select').forEach(select => {
        updateStatusColor(select);
    });
});

// Hide notifications after 5 seconds
setTimeout(() => {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.style.display = 'none';
    });
}, 5000);
</script>

</body>
</html>

<?php
// Helper functions
function getInitials($name) {
    $words = explode(' ', $name);
    $initials = '';
    foreach ($words as $word) {
        if (!empty($word)) {
            $initials .= strtoupper($word[0]);
        }
    }
    return substr($initials, 0, 2);
}

function getRandomColor($seed = null) {
    $colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
        '#9b59b6', '#1abc9c', '#d35400', '#34495e',
        '#16a085', '#27ae60', '#2980b9', '#8e44ad',
        '#2c3e50', '#f1c40f', '#e67e22', '#c0392b'
    ];
    
    if ($seed) {
        $hash = crc32($seed);
        return $colors[$hash % count($colors)];
    }
    
    return $colors[array_rand($colors)];
}