<?php
/*
    - Database server, username, password, and database name.
    - A MySQLi connection object `$conn`.
    - Error handling: if the connection fails, the script terminates with an error message.
    Purpose: Provides a ready-to-use database connection for other scripts in the "Detourist" project.
*/
?>

<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "louver";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn -> connect_error) {
    die ("Connection failed: " . $conn -> connect_error);
}
?>