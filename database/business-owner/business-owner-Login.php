<?php
session_start();

$conn = new mysqli("localhost", "root", "", "louver");
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
if ($email === '' || $password === '') {
  header("Location: ../../html/business-owner/business-owner-login.html?error=1");
  exit;
}

// 1) If password matches an application's temp_password → redirect to status page
$stmt = $conn->prepare("SELECT application_id, status FROM applications WHERE email = ? AND temp_password = ? ORDER BY submitted_at DESC LIMIT 1");
if ($stmt) {
  $stmt->bind_param('ss', $email, $password);
  $stmt->execute();
  $res = $stmt->get_result();
  if ($res && $res->num_rows === 1) {
    $app = $res->fetch_assoc();
    $stmt->close();
    if ($app['status'] === 'Approved') {
      // approved: fall through to vendor login
    } else {
      // pending/rejected: send to status page with credentials
      $params = http_build_query(['email' => $email, 'temp' => $password]);
      header("Location: ../../html/business-owner/application-status.html?" . $params);
      exit;
    }
  } else {
    $stmt->close();
  }
}

// 2) Vendor login: find vendor by email
$vendor = null;
$v = $conn->prepare("SELECT vendor_id, business_name, password_hash FROM vendors WHERE email = ? LIMIT 1");
if ($v) {
  $v->bind_param('s', $email);
  $v->execute();
  $vr = $v->get_result();
  if ($vr && $vr->num_rows === 1) { $vendor = $vr->fetch_assoc(); }
  $v->close();
}

if (!$vendor) {
  // Fallback: if approved application exists with this email and temp matches, link vendor
  $fa = $conn->prepare("SELECT vendor_id FROM applications WHERE email = ? AND status='Approved' AND temp_password = ? ORDER BY reviewed_at DESC LIMIT 1");
  if ($fa) {
    $fa->bind_param('ss', $email, $password);
    $fa->execute();
    $far = $fa->get_result();
    if ($far && $far->num_rows === 1) {
      $vid = (int)$far->fetch_assoc()['vendor_id'];
      $fa->close();
      if ($vid) {
        $b = $conn->prepare("SELECT vendor_id, business_name, password_hash FROM vendors WHERE vendor_id = ? LIMIT 1");
        if ($b) { $b->bind_param('i', $vid); $b->execute(); $br = $b->get_result(); if ($br && $br->num_rows === 1) { $vendor = $br->fetch_assoc(); } $b->close(); }
      }
    } else { $fa->close(); }
  }
}

if (!$vendor) {
  header("Location: ../../html/business-owner/business-owner-login.html?error=1");
  exit;
}

// Verify password (support hashed and legacy plain strings)
$valid = false;
if (!empty($vendor['password_hash'])) {
  if (password_verify($password, $vendor['password_hash'])) { $valid = true; }
  else if (hash_equals($vendor['password_hash'], $password)) { $valid = true; }
}
if (!$valid) {
  // Final fallback: if application temp matches and approved
  $fa2 = $conn->prepare("SELECT vendor_id FROM applications WHERE email = ? AND status='Approved' AND temp_password = ? ORDER BY reviewed_at DESC LIMIT 1");
  if ($fa2) { $fa2->bind_param('ss', $email, $password); $fa2->execute(); $r2 = $fa2->get_result(); if ($r2 && $r2->num_rows === 1) { $valid = true; } $fa2->close(); }
}
if (!$valid) {
  header("Location: ../../html/business-owner/business-owner-login.html?error=1");
  exit;
}

// Session and redirect
$_SESSION['vendor_id'] = (int)$vendor['vendor_id'];
$_SESSION['vendor_name'] = $vendor['business_name'];

// Optional: mark Online
$upd = $conn->prepare("UPDATE vendors SET session_status='Online' WHERE vendor_id = ?");
if ($upd) { $upd->bind_param('i', $_SESSION['vendor_id']); $upd->execute(); $upd->close(); }

// If they reached here with temp creds and are approved, send to products
header("Location: ../../html/business-owner/business-owner-products.html");
exit;
?>