# Louver: A Web-Based Food Delivery System for Saint Louis University – Maryheights Campus

**Course Requirement:** SOFTWARE ENGINEERING (9381 CS313)

---

## Project Overview

**Louver** is a web-based food delivery system designed for **Saint Louis University – Maryheights Campus**.  

The system provides functionalities for:

- **Customers / Users**:
  - Browse vendors and menus
  - Manage carts
  - Place orders

- **Business Owners**:
  - Register as a vendor
  - Manage products
  - Track and update orders

- **Admins**:
  - Review vendor applications
  - Manage businesses and users
  - Oversee orders and system operations

**Technologies Used:**

- Client-side: HTML, CSS, JavaScript  
- Server-side: PHP  
- Database: MySQL  

The system delivers dynamic web functionality using PHP scripts that interact with the MySQL database.

---

## Submitted By

- Heart Bhea J. CONVERSA  
- Zeus Marc C. ERESE  
- Jasmine Rose T. ESPEJO  
- Miguel Ryan N. MAGNO  
- Niña Aida B. PADUA  
- Hannah P. PARAYNO  
- Jasmine S. ROLLON  

---

## Database Setup

1. Open **phpMyAdmin**: [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/)
2. Create a new database named `louver`  
   - Collation: `utf8mb4_unicode_ci` (recommended)
3. Import the SQL file:
   - Go to the **Import** tab
   - Select the file located at: `database/louver.sql`
   - Click **Go** to execute the import
4. Verify that the required tables were created successfully

---

## Running the Project (WAMP)

1. Move the `Louver-FinalProject` folder into your server’s root directory:  
   - For WAMP: `C:\wamp64\www\`
2. Launch WAMP and ensure both **Apache** and **MySQL** services are running (tray icon green)
3. Configure database connection in `database/connectDB.php`:
   ```php
   // Example
   $host = 'localhost';
   $user = 'root';
   $password = '';
   $database = 'louver';
4. Ensure upload directories exist (e.g., uploads/permits/)
5. Open your web browser and navigate to: `http://localhost/Louver-FinalProject/index.html`

Role-specific pages:
Admin: html/admin/
Business Owner: html/business-owner/
User: html/user/
