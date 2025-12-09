-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 08, 2025 at 07:10 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `louver`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
CREATE TABLE IF NOT EXISTS `admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(150) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`admin_id`, `username`, `name`, `email`, `mobile_number`, `profile_image`, `password_hash`, `created_at`) VALUES
(1, 'admin1', 'John Lloyd Cruz', 'jlloydcruz@slu.edu.ph', '09123456789', NULL, '123', '2025-11-27 00:28:27'),
(2, 'admin2', 'Amanda Flores', 'amanda.flores@slu.edu.ph', '09381239812', NULL, '456', '2025-11-27 00:28:27');

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
CREATE TABLE IF NOT EXISTS `applications` (
  `application_id` varchar(10) NOT NULL,
  `registration_no` varchar(100) NOT NULL,
  `vendor_id` int DEFAULT NULL,
  `business_name` varchar(200) NOT NULL,
  `owner_name` varchar(150) DEFAULT NULL,
  `contact_number` varchar(20) NOT NULL,
  `address` varchar(255) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `location_detail` varchar(255) DEFAULT NULL,
  `business_permit` varchar(255) NOT NULL,
  `description` text,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `registration_no` (`registration_no`),
  KEY `status` (`status`),
  KEY `vendor_id` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`application_id`, `registration_no`, `vendor_id`, `business_name`, `owner_name`, `contact_number`, `address`, `email`, `location_detail`, `business_permit`, `description`, `status`, `rejection_reason`, `submitted_at`, `reviewed_at`) VALUES
('A001', 'permit_oval_001', 2, 'Oval Canteen', 'Marites Dela Cruz', '09171234567', 'SLU Bakakeng MaryHeights Campus Canteen', 'ovalcanteen.slu@gmail.com', '3rd Floor, Right Wing', 'permit_oval_001.pdf', 'Serving delicious Filipino-style fast food favorites. Home of crispy Chickenjoy and classic comfort meals.', 'Approved', NULL, '2025-10-15 09:30:00', '2025-12-08 18:34:21'),
('A002', 'permit_aroma_002', 3, 'Aroma & Blossom', 'Amanda Flores', '09381239812', 'SLU Bakakeng MaryHeights Campus Food Hall', 'aroma.blossom@gmail.com', '2nd Floor, Food Hall Section A', 'permit_aroma_002.pdf', 'Fresh flowers and aromatic coffee blends. Your perfect spot for specialty drinks and floral-inspired desserts.', 'Approved', NULL, '2025-11-02 14:20:00', '2025-12-08 18:34:21'),
('A003', 'permit_otg_003', 4, 'On The Go Cafe', 'John Reyes', '09981234566', 'SLU Bakakeng MaryHeights Campus Food Hall', 'onthegocafe.slu@gmail.com', '1st Floor, Food Hall Near Entrance', 'permit_otg_003.pdf', 'Quick bites and energizing beverages for students on the move. Perfect for busy schedules.', 'Approved', NULL, '2025-11-18 11:45:00', '2025-12-08 18:34:21'),
('A004', 'permit_mayos_004', 5, 'Mayo\'s Cup', 'Carlo Mendoza', '09192345678', 'SLU Bakakeng MaryHeights Campus Food Hall', 'mayoscup.ph@gmail.com', '2nd Floor, Food Hall Section B', 'permit_mayos_004.pdf', 'Premium coffee and refreshing beverages. Crafted with care for the perfect cup every time.', 'Approved', NULL, '2025-12-01 08:10:00', '2025-12-08 18:34:21'),
('A005', 'permit_emerson_005', 6, 'Emerson Canteen', 'Emerson Lao', '09275678912', 'SLU Bakakeng MaryHeights Campus Canteen', 'emersoncanteen@gmail.com', '1st Floor, Main Canteen Area', 'permit_emerson_005.pdf', 'Traditional Filipino home-cooked meals. Affordable and delicious comfort food.', 'Approved', NULL, '2025-11-25 16:00:00', '2025-12-08 18:34:21'),
('A006', 'permit_chickaboo_006', 7, 'Chickaboo', 'Rina Javier', '09451234789', 'SLU Bakakeng MaryHeights Campus Food Hall', 'chickaboo.ph@gmail.com', '2nd Floor, Food Hall Section C', 'permit_chickaboo_006.pdf', 'Crispy fried chicken and Korean-inspired flavors. Satisfying meals that hit the spot.', 'Approved', NULL, '2025-11-26 13:50:00', '2025-12-08 18:34:21'),
('A007', 'permit_lasa_007', NULL, 'Lasa Brew Coffee', 'Miguel Santos', '09123987654', 'SLU Bakakeng MaryHeights Campus Food Hall', 'lasabrew@gmail.com', '1st Floor, Food Hall Corner', 'permit_lasa_007.pdf', 'Locally roasted coffee beans. Experience authentic Filipino coffee culture.', 'Pending', NULL, '2025-11-28 10:15:00', NULL),
('A008', 'permit_spice_008', 9, 'The Spice Route', 'Priya Sharma', '09567123456', 'SLU Bakakeng MaryHeights Campus Canteen', 'spiceroute.slu@gmail.com', '2nd Floor, Canteen Wing B', 'permit_spice_008.pdf', 'Authentic Indian cuisine with aromatic spices. From mild to spicy, we have it all.', 'Approved', NULL, '2025-11-20 15:30:00', '2025-11-20 15:30:00'),
('A009', 'permit_bubble_009', NULL, 'Bubble Bliss', 'Sarah Kim', '09876543210', 'SLU Bakakeng MaryHeights Campus Food Hall', 'bubblebliss.ph@gmail.com', '1st Floor, Food Hall Near Stairs', 'permit_bubble_009.pdf', 'Premium milk tea and fruit tea selections. Fresh ingredients, perfect pearls.', 'Pending', NULL, '2025-12-02 09:00:00', NULL),
('A010', 'permit_grill_010', NULL, 'The Grill House', 'Victor Reyes', '09234567890', 'SLU Bakakeng MaryHeights Campus Canteen', 'grillhouse.slu@gmail.com', '3rd Floor, Canteen Outdoor Area', 'permit_grill_010.pdf', 'Grilled meats and BBQ specialties. Smoky flavors and hearty portions.', 'Rejected', 'Business permit expired', '2025-11-27 13:45:00', '2025-11-27 13:45:00'),
('A011', 'permit_vegan_011', NULL, 'Vegan Vibes', 'Elena Garcia', '09345678901', 'SLU Bakakeng MaryHeights Campus Food Hall', 'veganvibes@gmail.com', '2nd Floor, Food Hall Section D', 'permit_vegan_011.pdf', 'Plant-based meals that are both healthy and delicious. Sustainable dining options.', 'Approved', NULL, '2025-11-19 11:20:00', '2025-11-19 11:20:00'),
('A012', 'permit_sushi_012', NULL, 'Sushi Supreme', 'Takeshi Yamamoto', '09456789012', 'SLU Bakakeng MaryHeights Campus Food Hall', 'sushi.supreme@gmail.com', '2nd Floor, Food Hall Premium Section', 'permit_sushi_012.pdf', 'Fresh Japanese cuisine and sushi rolls. Authentic taste of Japan in every bite.', 'Pending', NULL, '2025-12-03 14:10:00', NULL),
('A013', 'permit_jollikod_001', 1, 'Jollikod', 'Jolli Dev', '09123450000', 'SLU Bakakeng MaryHeights Campus Food Hall', 'jollikod@slu.edu.ph', 'Ground Floor, Center Hall', 'permit_jollikod_001.pdf', 'Classic comfort meals and code-fueled bites.', 'Approved', NULL, '2025-10-10 10:00:00', '2025-12-08 18:34:21');

-- --------------------------------------------------------

--
-- Table structure for table `business_deletions`
--

DROP TABLE IF EXISTS `business_deletions`;
CREATE TABLE IF NOT EXISTS `business_deletions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `reason` text NOT NULL,
  `deleted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_by_admin` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `business_deletions`
--

INSERT INTO `business_deletions` (`id`, `vendor_id`, `reason`, `deleted_at`, `deleted_by_admin`) VALUES
(1, 12, 'Failed health compliance', '2025-12-09 02:22:34', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE IF NOT EXISTS `cart_items` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `customer_id` (`customer_id`),
  KEY `product_id` (`product_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `NAME` varchar(150) NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT 'default.png',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `NAME`, `contact_number`, `email`, `password_hash`, `profile_image`, `created_at`) VALUES
(1, 'Heart Bhea J. Conserva', '09123456789', 'heartconserva@gmail.com', '123', 'default.png', '2025-11-27 00:28:27'),
(2, 'Niña Aida B. Padua', '09911132114', 'ninapadua@gmail.com', 'baby', 'default.png', '2025-12-02 22:22:25'),
(3, 'Zeus Marc C. Erese', '09123456790', 'zeuserese@gmail.com', '123', 'default.png', '2025-12-08 19:06:25'),
(4, 'Jasmine Rose T. Espejo', '09123456791', 'jasmineespejo@gmail.com', '123', 'default.png', '2025-12-08 19:06:25'),
(5, 'Miguel Ryan N. Magno', '09123456792', 'miguelmagno@gmail.com', '123', 'default.png', '2025-12-08 19:06:25'),
(6, 'Hannah P. Parayno', '09123456793', 'hannahparayno@gmail.com', '123', 'default.png', '2025-12-08 19:06:25'),
(7, 'Jasmine S. Rollon', '09123456794', 'jasminerollon@gmail.com', '123', 'default.png', '2025-12-08 19:06:25');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` enum('COD') DEFAULT 'COD',
  `order_status` enum('Preparing','Ready','Delivered','Rejected') DEFAULT 'Preparing',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `customer_id` (`customer_id`),
  KEY `vendor_id` (`vendor_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `customer_id`, `vendor_id`, `total_price`, `payment_method`, `order_status`, `rejection_reason`, `created_at`) VALUES
(1, 2, 1, 313.00, 'COD', 'Delivered', NULL, '2025-10-16 10:15:00'),
(2, 2, 2, 240.00, 'COD', 'Ready', NULL, '2025-11-03 12:45:00'),
(3, 2, 3, 240.00, 'COD', 'Preparing', NULL, '2025-11-18 12:00:00'),
(4, 2, 4, 205.00, 'COD', 'Delivered', NULL, '2025-12-01 09:00:00'),
(5, 2, 5, 255.00, 'COD', 'Rejected', 'Vendor documents incomplete', '2025-11-26 14:30:00'),
(6, 2, 6, 210.00, 'COD', 'Delivered', NULL, '2025-11-27 11:20:00'),
(7, 1, 1, 328.00, 'COD', 'Preparing', NULL, '2025-12-08 19:06:26');

-- --------------------------------------------------------

--
-- Table structure for table `order_issues`
--

DROP TABLE IF EXISTS `order_issues`;
CREATE TABLE IF NOT EXISTS `order_issues` (
  `issue_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `issue_reason` varchar(255) NOT NULL,
  `description` text,
  `STATUS` enum('Pending','Reviewed','Resolved') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`issue_id`),
  KEY `order_id` (`order_id`),
  KEY `vendor_id` (`vendor_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `product_name`, `price_at_time`, `quantity`) VALUES
(12, 1, 1, '1 - pc. Chickenjoy w/ Jolly Spaghetti Solo', 164.00, 1),
(13, 1, 2, '2 - pc. Burger Steak Solo', 149.00, 1),
(14, 2, 26, 'Crispy Chicken w/ Rice', 110.00, 1),
(15, 2, 27, 'Beef Steak Tagalog', 130.00, 1),
(16, 3, 17, 'Lavender Honey Latte', 145.00, 1),
(17, 3, 19, 'Hibiscus Iced Tea', 95.00, 1),
(18, 4, 9, 'Ham & Cheese Croissant', 95.00, 1),
(19, 4, 10, 'Iced Latte', 110.00, 1),
(20, 5, 20, 'Signature Mayo Latte', 135.00, 1),
(21, 5, 21, 'Brown Sugar Milk Tea', 120.00, 1),
(22, 6, 13, 'Chicken Adobo', 90.00, 1),
(23, 6, 14, 'Beef Caldereta', 120.00, 1),
(24, 7, 1, '1 - pc. Chickenjoy w/ Jolly Spaghetti Solo', 164.00, 2);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `NAME` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT 'Popular',
  `image` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `vendor_id` (`vendor_id`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `vendor_id`, `NAME`, `category`, `image`, `description`, `price`, `created_at`) VALUES
(1, 1, '1 - pc. Chickenjoy w/ Jolly Spaghetti Solo', 'Popular', '1/chickenjoy_spaghetti.png', 'Philippines\' best-tasting crispy/licious, juicy/licious Chickenjoy that is crispy on the outside, tender and juicy on the inside.', 164.00, '2025-11-27 00:28:27'),
(2, 1, '2 - pc. Burger Steak Solo', 'Popular', '1/burger_steak.png', 'Tender beef patties with mushroom gravy and rice', 149.00, '2025-11-27 00:28:27'),
(3, 1, '1 - pc. Chickenjoy New Spicy Solo', 'Popular', '1/chickenjoy_spicy.jpg', 'New spicy variant of the classic Chickenjoy', 104.00, '2025-11-27 00:28:27'),
(4, 1, '1 - pc. Chickenjoy w/ Fries Solo', 'Popular', '1/chickenjoy_fries.jpg', 'Crispy Chickenjoy served with golden fries', 144.00, '2025-11-27 00:28:27'),
(5, 1, '6 - pc. Chicken Nuggets', 'Popular', '1/chicken_nuggets.png', 'Six pieces of crispy chicken nuggets', 128.00, '2025-11-27 00:28:27'),
(6, 1, 'Palabok Solo', 'Popular', '1/palabok.png', 'Filipino-style noodles with savory sauce and toppings', 141.00, '2025-11-27 00:28:27'),
(7, 2, 'Smoothie', 'Drinks', '2/smoothie.jpg', 'Mixed fruit smoothie', 70.00, '2025-11-27 00:28:27'),
(9, 4, 'Ham & Cheese Croissant', 'Sandwiches', '4/ham_cheese_croissant.jpg', 'Flaky croissant with ham and melted cheese', 95.00, '2025-12-08 18:34:21'),
(10, 4, 'Iced Latte', 'Coffee', '4/iced_latte.jpg', 'Smooth espresso with cold milk over ice', 110.00, '2025-12-08 18:34:21'),
(11, 4, 'Tuna Pandesal', 'Snacks', '4/tuna_pandesal.jpg', 'Soft pandesal filled with creamy tuna', 50.00, '2025-12-08 18:34:21'),
(12, 4, 'Banana Muffin', 'Pastries', '4/banana_muffin.jpg', 'Freshly baked moist banana muffin', 60.00, '2025-12-08 18:34:21'),
(13, 6, 'Chicken Adobo', 'Meals', '6/adobo.jpg', 'Classic Filipino chicken adobo with rice', 90.00, '2025-12-08 18:34:21'),
(14, 6, 'Beef Caldereta', 'Meals', '6/caldereta.jpg', 'Spicy beef stew with potatoes and carrots', 120.00, '2025-12-08 18:34:21'),
(15, 6, 'Lumpiang Shanghai (8pcs)', 'Snacks', '6/lumpia.jpg', 'Crispy mini spring rolls with dipping sauce', 85.00, '2025-12-08 18:34:21'),
(16, 6, 'Mais Con Yelo', 'Dessert', '6/mais_con_yelo.jpg', 'Sweet corn with shaved ice and milk', 70.00, '2025-12-08 18:34:21'),
(17, 3, 'Lavender Honey Latte', 'Coffee', '3/lavender_latte.jpg', 'Calming lavender-infused latte with honey', 145.00, '2025-12-08 18:34:21'),
(18, 3, 'Rose Petal Cheesecake', 'Dessert', '3/rose_cheesecake.jpg', 'Light cheesecake with real rose petals', 130.00, '2025-12-08 18:34:21'),
(19, 3, 'Hibiscus Iced Tea', 'Drinks', '3/hibiscus_tea.jpg', 'Refreshing floral iced tea', 95.00, '2025-12-08 18:34:21'),
(20, 5, 'Signature Mayo Latte', 'Coffee', '5/mayo_latte.jpg', 'House special creamy latte', 135.00, '2025-12-08 18:34:21'),
(21, 5, 'Brown Sugar Milk Tea', 'Milk Tea', '5/brown_sugar_mt.jpg', 'Freshly cooked pearls in brown sugar milk tea', 120.00, '2025-12-08 18:34:21'),
(22, 5, 'Matcha Strawberry Frappe', 'Frappes', '5/matcha_strawberry.jpg', 'Blended matcha with real strawberries', 155.00, '2025-12-08 18:34:21'),
(23, 7, 'Original Fried Chicken (6pcs)', 'Chicken', '7/original_chicken.jpg', 'Classic crispy fried chicken', 280.00, '2025-12-08 18:34:21'),
(24, 7, 'Spicy Gochujang Chicken', 'Chicken', '7/gochujang_chicken.jpg', 'Extra spicy Korean-style chicken', 300.00, '2025-12-08 18:34:21'),
(25, 7, 'Cheese Balls Side', 'Sides', '7/cheese_balls.jpeg', 'Melted cheese-stuffed fried balls', 120.00, '2025-12-08 18:34:21'),
(26, 2, 'Crispy Chicken w/ Rice', 'Meals', '2/crispy_chicken.jpg', 'Crispy fried chicken with steamed rice', 110.00, '2025-12-08 19:06:25'),
(27, 2, 'Beef Steak Tagalog', 'Meals', '2/beef_steak.jpg', 'Tender beef in soy-onion sauce with rice', 130.00, '2025-12-08 19:06:25'),
(28, 2, 'Pork Adobo', 'Meals', '2/pork_adobo.png', 'Classic pork adobo stew with rice', 105.00, '2025-12-08 19:06:25');

-- --------------------------------------------------------

--
-- Table structure for table `product_deletions`
--

DROP TABLE IF EXISTS `product_deletions`;
CREATE TABLE IF NOT EXISTS `product_deletions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `reason` text,
  `deleted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
CREATE TABLE IF NOT EXISTS `vendors` (
  `vendor_id` int NOT NULL AUTO_INCREMENT,
  `business_name` varchar(200) NOT NULL,
  `owner_name` varchar(150) DEFAULT NULL,
  `contact_number` varchar(20) NOT NULL,
  `address` varchar(255) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `description` text,
  `estimated_time` varchar(50) DEFAULT '10 mins',
  `location_detail` varchar(255) DEFAULT NULL,
  `business_permit` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT 'default.png',
  `password_hash` varchar(255) DEFAULT NULL,
  `session_status` enum('Online','Offline') DEFAULT 'Offline',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `banner_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `business_name` (`business_name`),
  KEY `session_status` (`session_status`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`vendor_id`, `business_name`, `owner_name`, `contact_number`, `address`, `email`, `description`, `estimated_time`, `location_detail`, `business_permit`, `profile_image`, `password_hash`, `session_status`, `created_at`, `banner_image`) VALUES
(1, 'Jollikod', 'Jolli Dev', '09123450000', 'SLU Bakakeng MaryHeights Campus Food Hall', 'jollikod@slu.edu.ph', 'Classic comfort meals and code-fueled bites.', '10 mins', 'Ground Floor, Center Hall', 'permit_jollikod_001.pdf', 'jollikod.jpg', 'hash000', 'Offline', '2025-10-10 10:00:00', 'banner_default.jpg'),
(2, 'Oval Canteen', 'Marites Dela Cruz', '09171234567', 'SLU Bakakeng MaryHeights Campus Canteen', 'ovalcanteen.slu@gmail.com', 'Serving delicious Filipino-style fast food favorites. Home of crispy Chickenjoy and classic comfort meals.', '10 mins', '3rd Floor, Right Wing', 'permit_oval_001.pdf', 'oval_canteen.png', 'hash001', 'Offline', '2025-10-15 09:30:00', 'banner_default.jpg'),
(3, 'Aroma & Blossom', 'Amanda Flores', '09381239812', 'SLU Bakakeng MaryHeights Campus Food Hall', 'aroma.blossom@gmail.com', 'Fresh flowers and aromatic coffee blends. Your perfect spot for specialty drinks and floral-inspired desserts.', '15 mins', '2nd Floor, Food Hall Section A', 'permit_aroma_002.pdf', 'aroma_blossom.png', 'hash002', 'Offline', '2025-11-02 14:20:00', 'banner_default.jpg'),
(4, 'On The Go Cafe', 'John Reyes', '09981234566', 'SLU Bakakeng MaryHeights Campus Food Hall', 'onthegocafe.slu@gmail.com', 'Quick bites and energizing beverages for students on the move. Perfect for busy schedules.', '10 mins', '1st Floor, Food Hall Near Entrance', 'permit_otg_003.pdf', 'onthego.png', 'temp_hash_otg', 'Offline', '2025-12-08 18:34:21', 'banner_default.jpg'),
(5, 'Mayo\'s Cup', 'Carlo Mendoza', '09192345678', 'SLU Bakakeng MaryHeights Campus Food Hall', 'mayoscup.ph@gmail.com', 'Premium coffee and refreshing beverages. Crafted with care for the perfect cup every time.', '12 mins', '2nd Floor, Food Hall Section B', 'permit_mayos_004.pdf', 'mayos_cup.png', 'hash004', 'Offline', '2025-12-01 08:10:00', 'banner_default.jpg'),
(6, 'Emerson Canteen', 'Emerson Lao', '09275678912', 'SLU Bakakeng MaryHeights Campus Canteen', 'emersoncanteen@gmail.com', 'Traditional Filipino home-cooked meals. Affordable and delicious comfort food.', '15 mins', '1st Floor, Main Canteen Area', 'permit_emerson_005.pdf', 'emerson.jpg', 'temp_hash_emerson', 'Offline', '2025-12-08 18:34:21', 'banner_default.jpg'),
(7, 'Chickaboo', 'Rina Javier', '09451234789', 'SLU Bakakeng MaryHeights Campus Food Hall', 'chickaboo.ph@gmail.com', 'Crispy fried chicken and Korean-inspired flavors. Satisfying meals that hit the spot.', '15 mins', '2nd Floor, Food Hall Section C', 'permit_chickaboo_006.pdf', 'chickaboo.png', 'hash006', 'Offline', '2025-11-26 13:50:00', 'banner_default.jpg'),
(9, 'The Spice Route', 'Priya Sharma', '09567123456', 'SLU Bakakeng MaryHeights Campus Canteen', 'spiceroute.slu@gmail.com', 'Authentic Indian cuisine with aromatic spices. From mild to spicy, we have it all.', '20 mins', '2nd Floor, Canteen Wing B', 'permit_spice_008.pdf', 'spiceroute.jpg', 'hash008', 'Offline', '2025-11-20 15:30:00', NULL);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `fk_app_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;