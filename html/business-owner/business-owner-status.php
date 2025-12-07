<?php
session_start();

if (!isset($_SESSION['vendor_id'])) {
    header("Location: ../../html/business-owner/business-owner-login.html");
    exit();
}

$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$vendor_id = $_SESSION['vendor_id'];
$stmt = $conn->prepare("SELECT email, password_hash, STATUS, rejection_reason FROM vendors WHERE vendor_id = ?");
$stmt->bind_param("i", $vendor_id);
$stmt->execute();
$result = $stmt->get_result();
$vendor = $result->fetch_assoc();

$status = $vendor['STATUS'];
$email = $vendor['email'];
$password = $vendor['password_hash'];
$rejection_reason = $vendor['rejection_reason'];
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status | Louver</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../../css/business-owner/business-homepage.css">
</head>
<body>

<!-- NAVBAR -->
<div class="navbar">
    <div class="logo">
        <img src="../../assets/pictures/logo.png" alt="Louver Logo">
        <span>LOUVER</span>
    </div>

    <div class="navbar-right">
        <div class="logout-group">
            <a href="../../database/business-owner/logout.php" class="login-btn">Log Out</a>
            <div class="user-icon">
                <i class="fas fa-user"></i>
            </div>
        </div>
    </div>
</div>

<!-- PAGE CONTENT -->
<div class="status-wrapper">
    <h2 class="top-label">Application Status</h2>
    <h1 class="pending-text <?php echo strtolower($status); ?>">
        <?php echo $status; ?>
    </h1>

    <div class="status-box">
        <?php if($status === 'Pending'): ?>
            <h3>In progress</h3>
            <p>Your application is being reviewed by the admins. Check back soon for updates.</p>

        <?php elseif($status === 'Approved'): ?>
            <h3>Congratulations!</h3>
            <p>Your application has been approved. You can now access your account and dashboard.</p>

            <!-- Temporary Credentials -->
            <div class="credentials-wrapper">
                <h2>Temporary Credentials</h2>
                <div class="credentials-box">
                    <h3>Login Info</h3>
                    <div class="cred-field"><?php echo $email; ?></div>
                    <div class="cred-field"><?php echo $password; ?></div>
                    <p class="note">Use these credentials to login to your account.</p>
                </div>
            </div>

        <?php else: ?>
            <h3>Application Rejected</h3>
            <p>Your application did not meet the required criteria:</p>
            <p><strong><?php echo $rejection_reason; ?></strong></p>
            <button class="apply-btn">Apply again</button>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
