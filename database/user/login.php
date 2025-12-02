<?php
session_start();
// to implement once the logout works 
//  1-browser-tab login restriction
// if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
//     echo json_encode([
//         'status' => 'already_logged_in',
//         'message' => 'You are already logged in.'
//     ]);
//     exit;
// }

header('Content-Type: application/json');

require '../connectDB.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
        exit;
    }

    $stmt = $conn->prepare("SELECT customer_id, NAME, password_hash FROM customers WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($customer_id, $name, $password_hash);
        $stmt->fetch();

        //verify hashed password
        if ($password === $password_hash) {
            
            // store session
            $_SESSION['customer_id'] = $customer_id;
            $_SESSION['customer_name'] = $name;
            $_SESSION['customer_email'] = $email;
            $_SESSION['logged_in'] = true;

            echo json_encode([
                'status' => 'success',
                'message' => 'Login successful',
                'customer_id' => $customer_id,
                'name' => $name
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Incorrect password']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Email not found']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
}
?>
