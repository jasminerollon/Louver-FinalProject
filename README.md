**Louver: A Web-Based Food Delivery System for Saint Louis University – Maryheights Campus**

A requirement in the course **SOFTWARE ENGINEERING (9381 CS313)**

**Project Overview**
Louver is a web-based food delivery system for Saint Louis University – Maryheights Campus. It enables customers to browse vendors and menus, manage carts, and place orders; business owners to register and manage products/orders; and admins to review applications, manage businesses, and oversee orders.

The system uses client-side technologies (HTML, CSS, JavaScript) and server-side scripting via PHP, all accessing a MySQL database to deliver dynamic web functionality.

Submitted by
CONSERVA, Heart Bhea J.
ERESE, Zeus Marc C.
ESPEJO, Jasmine Rose T.
MAGNO, Miguel Ryan N.
PADUA, Niña Aida B.
PARAYNO, Hannah P.
ROLLON, Jasmine S.

**Database Setup**
1. Open phpMyAdmin: http://localhost/phpmyadmin/
2. Create a new database: louver
   - Collation: utf8mb4_unicode_ci (recommended)
3. Import the SQL file:
   - Go to the Import tab.
   - Select the file located at: database/louver.sql
   - Click Go to execute the import.
4. Verify that required tables were created successfully.

**Running the Project (WAMP)**
1. Move the Louver-FinalProject folder into your server’s root directory.
   - For WAMP users: place it inside C:\wamp64\www\
2. Launch WAMP and ensure both Apache and MySQL services are running (tray icon green).
3. Configure database connection in database/connectDB.php (host, user, password, database).
4. Ensure upload directories exist (e.g., uploads/permits/).
5. Open your web browser and navigate to: http://localhost/Louver-FinalProject/index.html
   - Role-specific pages are under html/admin/, html/business-owner/, and html/user/.

Note
- PHP endpoints are under the database/ folder and are called via JS.
- Internet access is required for CDN resources (Google Fonts, Font Awesome).
