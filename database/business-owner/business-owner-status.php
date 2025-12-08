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

$vendor_id = (int)$_SESSION['vendor_id'];

// Fetch latest application status for this vendor
$status = 'Approved';
$rejection_reason = null;
$email = '';
$password = '';

$app = $conn->prepare("SELECT email, status, rejection_reason FROM applications WHERE vendor_id = ? ORDER BY reviewed_at DESC, submitted_at DESC LIMIT 1");
if ($app) {
    $app->bind_param("i", $vendor_id);
    $app->execute();
    $appRes = $app->get_result();
    if ($appRes && $appRes->num_rows === 1) {
        $row = $appRes->fetch_assoc();
        $email = $row['email'] ?? '';
        $status = $row['status'] ?? 'Approved';
        $rejection_reason = $row['rejection_reason'] ?? null;
    }
    $app->close();
}

// Fetch vendor credentials
$ven = $conn->prepare("SELECT email, password_hash FROM vendors WHERE vendor_id = ?");
if ($ven) {
    $ven->bind_param("i", $vendor_id);
    $ven->execute();
    $venRes = $ven->get_result();
    if ($venRes && $venRes->num_rows === 1) {
        $v = $venRes->fetch_assoc();
        $email = $v['email'] ?? $email;
        $password = $v['password_hash'] ?? '';
    }
    $ven->close();
}
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
    <style>
        .pending { color: #e59f00; }
        .approved { color: #1a7f37; }
        .rejected { color: #b42318; }
    </style>
    </head>
<body>
<div class="navbar">
    <div class="logo">
        <img src="../../assets/pictures/logo.png" alt="Louver Logo">
        <span>LOUVER</span>
    </div>
    <div class="navbar-right">
        <div class="logout-group">
            <a href="../../database/business-owner/logout.php" class="login-btn">Log Out</a>
            <div class="user-icon"><i class="fas fa-user"></i></div>
        </div>
    </div>
    </div>

<div class="status-wrapper">
    <h2 class="top-label">Application Status</h2>
    <h1 class="pending-text <?php echo strtolower($status); ?>">
        <?php echo htmlspecialchars($status); ?>
    </h1>

    <div class="status-box">
        <?php if ($status === 'Pending'): ?>
            <h3>In progress</h3>
            <p>Your application is being reviewed by the admins. Check back soon for updates.</p>
        <?php elseif ($status === 'Approved'): ?>
            <h3>Congratulations!</h3>
            <p>Your application has been approved. You can now access your account and dashboard.</p>
            <div class="credentials-wrapper">
                <h2>Temporary Credentials</h2>
                <div class="credentials-box">
                    <h3>Login Info</h3>
                    <div class="cred-field"><?php echo htmlspecialchars($email); ?></div>
                    <div class="cred-field"><?php echo htmlspecialchars($password); ?></div>
                    <p class="note">Use these credentials to login to your account.</p>
                </div>
            </div>
        <?php else: ?>
            <h3>Application Rejected</h3>
            <p>Your application did not meet the required criteria:</p>
            <p><strong><?php echo htmlspecialchars($rejection_reason ?? ''); ?></strong></p>
            <button class="apply-btn">Apply again</button>
        <?php endif; ?>
    </div>
</div>
</body>
</html>