<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
  exit;
}

require_once '../connectDB.php';
if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'DB connection failed']);
  exit;
}

// Support both JSON and multipart/form-data
$admin_id = $_SESSION['admin_id'];
$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
$isMultipart = stripos($contentType, 'multipart/form-data') !== false;

if ($isMultipart) {
  $name = isset($_POST['name']) ? trim($_POST['name']) : null;
  $email = isset($_POST['email']) ? trim($_POST['email']) : null;
  $mobile = isset($_POST['mobile_number']) ? trim($_POST['mobile_number']) : null;
  $removeImage = isset($_POST['remove_image']) && $_POST['remove_image'] === '1';
} else {
  $input = json_decode(file_get_contents('php://input'), true);
  if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
  }
  $name = isset($input['name']) ? trim($input['name']) : null;
  $email = isset($input['email']) ? trim($input['email']) : null;
  $mobile = isset($input['mobile_number']) ? trim($input['mobile_number']) : null;
  $removeImage = false;
}

// Basic validation (optional)
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['status' => 'error', 'message' => 'Invalid email']);
  exit;
}

// Handle optional profile image upload
$profileImagePath = null;
if ($isMultipart && isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] !== UPLOAD_ERR_NO_FILE) {
  $file = $_FILES['profile_image'];
  if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'File upload error']);
    exit;
  }

  // Validate type and size
  $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime = $finfo->file($file['tmp_name']);
  if (!isset($allowedTypes[$mime])) {
    http_response_code(415);
    echo json_encode(['status' => 'error', 'message' => 'Unsupported image type']);
    exit;
  }
  if ($file['size'] > 5 * 1024 * 1024) { // 5MB
    http_response_code(413);
    echo json_encode(['status' => 'error', 'message' => 'File too large']);
    exit;
  }

  // Destination directories
  $rootDir = realpath(__DIR__ . '/../../');
  if ($rootDir === false) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server path resolution failed']);
    exit;
  }
  $destDir = $rootDir . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'pictures';
  if (!is_dir($destDir)) {
    if (!mkdir($destDir, 0775, true)) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Failed to create image directory']);
      exit;
    }
  }
  $profileDir = $destDir . DIRECTORY_SEPARATOR . 'profiles';
  if (!is_dir($profileDir)) {
    if (!mkdir($profileDir, 0775, true)) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Failed to create profiles directory']);
      exit;
    }
  }

  $ext = $allowedTypes[$mime];
  $filename = 'admin_' . $admin_id . '_' . time() . '.' . $ext;
  $targetPath = $profileDir . DIRECTORY_SEPARATOR . $filename;
  if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to save uploaded image']);
    exit;
  }
  // Web path with forward slashes
  $profileImagePath = 'assets/pictures/profiles/' . $filename;
}

// Update query varies if image uploaded
if ($profileImagePath) {
  $query = "UPDATE admins SET name = ?, email = ?, mobile_number = ?, profile_image = ? WHERE admin_id = ?";
  $stmt = $conn->prepare($query);
} elseif ($isMultipart && isset($removeImage) && $removeImage) {
  $query = "UPDATE admins SET name = ?, email = ?, mobile_number = ?, profile_image = NULL WHERE admin_id = ?";
  $stmt = $conn->prepare($query);
} else {
  $query = "UPDATE admins SET name = ?, email = ?, mobile_number = ? WHERE admin_id = ?";
  $stmt = $conn->prepare($query);
}
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
  exit;
}

if ($profileImagePath) {
  $stmt->bind_param('ssssi', $name, $email, $mobile, $profileImagePath, $admin_id);
} elseif ($isMultipart && isset($removeImage) && $removeImage) {
  $stmt->bind_param('sssi', $name, $email, $mobile, $admin_id);
} else {
  $stmt->bind_param('sssi', $name, $email, $mobile, $admin_id);
}
if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $stmt->error]);
  $stmt->close();
  $conn->close();
  exit;
}

$stmt->close();
$conn->close();

echo json_encode(['status' => 'success', 'message' => 'Profile updated']);
