<?php
session_start();

// Include database connection
$root = $_SERVER['DOCUMENT_ROOT'] . '/Louver/';

// Try multiple possible paths for the database connection
$possiblePaths = [
    $root . 'database/connectDB.php',
    dirname(__DIR__, 2) . '/database/connectDB.php', // Go up 2 levels from html/business-owner
    'C:/wamp64/www/Louver/database/connectDB.php'
];

$conn = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        break;
    }
}

// If connection failed, display error
if (!isset($conn) || !$conn) {
    die("Database connection failed. Please check connectDB.php file.");
}

// Check if vendor is logged in - for demo, use vendor_id = 1 (Jollibee)
if (!isset($_SESSION['vendor_id'])) {
    $_SESSION['vendor_id'] = 1; // Default to Jollibee for testing
}

$vendor_id = $_SESSION['vendor_id'];

// Fetch orders for this vendor
$sql = "SELECT o.order_id, o.total_price, o.order_status, o.created_at, 
        c.NAME AS customer_name, c.contact_number, c.email,
        v.business_name
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN vendors v ON o.vendor_id = v.vendor_id
        WHERE o.vendor_id = ?
        ORDER BY o.created_at DESC";
        
$orders = [];
try {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $vendor_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result) {
        $orders = $result->fetch_all(MYSQLI_ASSOC);
    }
} catch (Exception $e) {
    error_log("Database error: " . $e->getMessage());
    // Continue with empty orders array
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
            <a href="business-owner-products.php">PRODUCTS</a>
            <a href="business-owner-myorders.php" class="active">ORDERS</a>
            <a href="business-owner-account.php">PROFILE</a>
        </nav>
    </div>
</div>

<div class="orders-container">

    <!-- Top Bar -->
    <div class="orders-top">
      <div class="search-wrapper">
        <i class="fa fa-search"></i>
        <input type="text" id="searchInput" placeholder="Search order ID">
      </div>

      <div class="date-sort">
        <div class="sort-dropdown">
          <button class="sort-btn">Sort by: <span id="sort-value">Relevance</span> <i class="fa fa-caret-down"></i></button>
        </div>
        <p class="date-label"><?php echo date('F d, Y | h:i A'); ?></p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="orders-tabs">
        <button class="tab active" data-tab="orders">ORDERS</button>
        <button class="tab" data-tab="refunds">REFUNDS</button>
    </div>

    <!-- Orders Table -->
    <div class="orders-table-wrapper">
      <table class="orders-table">
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
          <?php if (!empty($orders)): ?>
            <?php foreach ($orders as $order): ?>
            <?php 
            // Map database status to CSS class
            $status_class = strtolower($order['order_status']);
            if (!in_array($status_class, ['preparing', 'pending', 'delivered', 'failed'])) {
                // Map database status to available CSS classes
                if ($order['order_status'] === 'Rejected') {
                    $status_class = 'failed';
                } elseif ($order['order_status'] === 'Ready') {
                    $status_class = 'preparing';
                }
            }
            ?>
            <tr data-tab="orders" data-order-id="<?php echo $order['order_id']; ?>">
                <td><?php echo htmlspecialchars($order['order_id']); ?></td>
                <td><?php echo date('M d, Y | h:i A', strtotime($order['created_at'])); ?></td>
                <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
                <td><?php echo htmlspecialchars($order['business_name']); ?></td>
                <td>₱ <?php echo number_format($order['total_price'], 2); ?></td>
                <td><span class="status <?php echo $status_class; ?>"><?php echo $order['order_status']; ?></span></td>
                <td><button class="view-btn" data-order-id="<?php echo $order['order_id']; ?>"><i class="fa fa-eye"></i> View</button></td>
            </tr>
            <?php endforeach; ?>
          <?php else: ?>
            <!-- Show sample data if no orders from database -->
            <tr data-tab="orders">
              <td>104</td>
              <td>Dec 13, 2025 | 12:51 PM</td>
              <td>Juan Dela Cruz</td>
              <td>Jollibee</td>
              <td>₱ 1,028</td>
              <td><span class="status preparing">Preparing</span></td>
              <td><button class="view-btn"><i class="fa fa-eye"></i> View</button></td>
            </tr>
            <tr data-tab="orders">
              <td>105</td>
              <td>Dec 1, 2025 | 1:34 PM</td>
              <td>Sierra Madre</td>
              <td>Jollibee</td>
              <td>₱ 653</td>
              <td><span class="status pending">Pending</span></td>
              <td><button class="view-btn"><i class="fa fa-eye"></i> View</button></td>
            </tr>
            <tr data-tab="orders">
              <td>106</td>
              <td>Dec 4, 2025 | 5:30 PM</td>
              <td>Miguel Magno</td>
              <td>Jollibee</td>
              <td>₱ 1,243</td>
              <td><span class="status delivered">Delivered</span></td>
              <td><button class="view-btn"><i class="fa fa-eye"></i> View</button></td>
            </tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>

</div>

<!-- MODAL (POPUP)-->
<div class="modal-overlay" id="orderModal">
  <div class="modal">

    <button class="close-btn" id="closeModalBtn">&times;</button>

    <h1 class="order-title">Order <span id="modalOrderId">105</span> <span class="status pending" id="modalStatus">Pending</span></h1>
    <p class="ordered-date" id="modalOrderDate">Ordered on: Dec 1, 2025 | 1:34 PM</p>

    <div class="modal-content">

      <!-- LEFT SECTION -->
      <div class="left-section">
        <div class="profile">
          <div class="avatar" id="modalAvatar"></div>
          <h3 id="modalCustomerName">Sierra Madre</h3>
        </div>

        <div class="contact-info">
          <p><strong>Contact Info</strong></p>
          <p id="modalContactNumber">0952 123 2345</p>
          <p id="modalEmail">sierramadre@slu.edu.ph</p>
        </div>

        <div class="order-note">
          <p><strong>Order Note</strong></p>
          <p id="modalOrderNote">Do not include utensils please!</p>
        </div>

        <button class="contact-user-btn" id="contactUserBtn">Contact User</button>
      </div>

      <!-- RIGHT SECTION -->
      <div class="right-section">

        <div class="section" id="itemsSection">
          <h3>Items</h3>
          <!-- Items will be loaded dynamically -->
          <div class="item">
            <span>3x 1-pc. Chickenjoy w/ Jolly Spaghetti Solo</span>
            <span>₱ 492</span>
          </div>
          <div class="item">
            <span>1x Palabok Solo</span>
            <span>₱ 141</span>
          </div>
        </div>

        <div class="section">
          <h3>Payment Summary</h3>
          <div class="summary-row"><span>Subtotal (4 items)</span><span id="modalSubtotal">₱ 633</span></div>
          <div class="summary-row"><span>Delivery</span><span id="modalDelivery">₱ 20</span></div>
          <hr />
          <div class="summary-row total"><span>TOTAL</span><span id="modalTotal">₱ 653</span></div>
        </div>

        <div class="delivery-actions-row">

        <div class="delivery-box">
            <h3>Delivery Information</h3>
            <p><strong id="modalDeliveryType">Standard Delivery</strong></p>
            <p>Location: <span id="modalLocation">D502</span></p>
            <p>Date: <span id="modalDeliveryDate">December 1, 2025</span></p>
            <p>Time: <span id="modalDeliveryTime">Pending</span></p>
        </div>

        <div class="action-buttons">
            <button class="report-btn" id="reportBtn">Report Order</button>
            <button class="cancel-btn" id="cancelBtn">Cancel Order</button>
        </div>

    </div>


      </div>

    </div>
  </div>
</div>

<!--REPORT ORDER MODAL-->
<div class="report-modal-overlay" id="reportModal">
  <div class="report-modal">

      <button class="report-close-btn" id="closeReportModal">&times;</button>

      <h2 class="report-title">Report Order</h2>

      <div class="report-section">
          <label>Category</label>
          <div class="custom-select">
              <select id="reportCategory">
                  <option>Incomplete Payment</option>
                  <option>Missing Item</option>
                  <option>Fake Proof</option>
                  <option>Incorrect Amount</option>
              </select>
              <i class="fa-solid fa-caret-down"></i>
          </div>
      </div>

      <div class="report-section">
        <label>Proof</label>
        <div class="upload-box" id="uploadBox">
            <i class="fa-solid fa-image"></i>
            <p>Upload screenshots, photos, or videos</p>
        </div>
        <input type="file" id="fileInput" style="display:none;" accept="image/*,video/*">
    </div>


      <div class="report-section">
          <label>Additional Information</label>
          <textarea id="reportDescription" placeholder="Type here"></textarea>
      </div>

      <div class="report-buttons">
          <button class="confirm-report" id="confirmReportBtn">CONFIRM</button>
          <button class="cancel-report" id="cancelReportBtn">CANCEL</button>
      </div>

  </div>
</div>

<!-- CANCEL ORDER MODAL -->
<div class="cancel-modal-overlay" id="cancelOrderModal">
    <div class="cancel-modal">

        <h2 class="cancel-title">Cancel Order</h2>
        <p class="cancel-subtitle">Are you sure you want to<br><strong id="cancelOrderText">cancel Order 105?</strong></p>

        <label class="cancel-label">Reason of cancellation</label>

        <div class="cancel-textarea-wrapper">
            <textarea class="cancel-textarea" id="cancelReason" placeholder="Type reason here"></textarea>
        </div>

        <div class="cancel-buttons">
            <button class="cancel-confirm-btn" id="confirmCancelBtn">CONFIRM</button>
            <button class="cancel-cancel-btn" id="closeCancelModal">CANCEL</button>
        </div>

    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="../../js/business-owner/business-owner-myorders.js"></script>
<script>
// Store orders data for JavaScript
const ordersData = <?php echo json_encode($orders); ?>;
</script>

</body>
</html>