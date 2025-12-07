-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 07, 2025 at 02:54 PM
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

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`cart_id`, `customer_id`, `product_id`, `quantity`, `added_at`) VALUES
(1, 1, 1, 2, '2025-11-27 00:28:27');

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
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `NAME`, `contact_number`, `email`, `password_hash`, `profile_image`, `created_at`) VALUES
(1, 'Heart', '09123456789', 'heartconserva@gmail.com', '123', 'default.png', '2025-11-27 00:28:27'),
(2, 'Nina Padua', '09911132114', 'baby@gmail.com', 'baby', 'default.png', '2025-12-02 22:22:25');

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
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `customer_id`, `vendor_id`, `total_price`, `payment_method`, `order_status`, `rejection_reason`, `created_at`) VALUES
(1, 2, 1, 150.50, 'COD', 'Delivered', NULL, '2025-10-16 10:15:00'),
(2, 2, 2, 220.00, 'COD', 'Ready', NULL, '2025-11-03 12:45:00'),
(3, 2, 3, 120.75, 'COD', 'Preparing', NULL, '2025-11-18 12:00:00'),
(4, 2, 4, 95.25, 'COD', 'Delivered', NULL, '2025-12-01 09:00:00'),
(5, 2, 5, 180.00, 'COD', 'Rejected', 'Vendor documents incomplete', '2025-11-26 14:30:00'),
(6, 2, 6, 200.50, 'COD', 'Delivered', NULL, '2025-11-27 11:20:00');

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `vendor_id`, `NAME`, `category`, `image`, `description`, `price`, `created_at`) VALUES
(1, 1, '1 - pc. Chickenjoy w/ Jolly Spaghetti Solo', 'Popular', 'chickenjoy_spaghetti.jpg', 'Philippines\' best-tasting crispy/licious, juicy/licious Chickenjoy that is crispy on the outside, tender and juicy on the inside.', 164.00, '2025-11-27 00:28:27'),
(2, 1, '2 - pc. Burger Steak Solo', 'Popular', 'burger_steak.jpg', 'Tender beef patties with mushroom gravy and rice', 149.00, '2025-11-27 00:28:27'),
(3, 1, '1 - pc. Chickenjoy New Spicy Solo', 'Popular', 'chickenjoy_spicy.jpg', 'New spicy variant of the classic Chickenjoy', 104.00, '2025-11-27 00:28:27'),
(4, 1, '1 - pc. Chickenjoy w/ Fries Solo', 'Popular', 'chickenjoy_fries.jpg', 'Crispy Chickenjoy served with golden fries', 144.00, '2025-11-27 00:28:27'),
(5, 1, '6 - pc. Chicken Nuggets', 'Popular', 'chicken_nuggets.jpg', 'Six pieces of crispy chicken nuggets', 128.00, '2025-11-27 00:28:27'),
(6, 1, 'Palabok Solo', 'Popular', 'palabok.jpg', 'Filipino-style noodles with savory sauce and toppings', 141.00, '2025-11-27 00:28:27'),
(7, 2, 'Smoothie', 'Drinks', 'smoothie.jpg', 'Mixed fruit smoothie', 70.00, '2025-11-27 00:28:27');

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
  `STATUS` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `banner_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `business_name` (`business_name`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`vendor_id`, `business_name`, `owner_name`, `contact_number`, `address`, `email`, `description`, `estimated_time`, `location_detail`, `business_permit`, `profile_image`, `STATUS`, `rejection_reason`, `password_hash`, `created_at`, `banner_image`) VALUES
(2, 'Oval Canteen', 'Marites Dela Cruz', '09171234567', 'SLU Bakakeng MaryHeights Campus Canteen', 'ovalcanteen.slu@gmail.com', 'Serving delicious Filipino-style fast food favorites. Home of crispy Chickenjoy and classic comfort meals.', '10 mins', '3rd Floor, Right Wing', 'permit_oval_001.pdf', 'oval_canteen.png', 'Approved', NULL, 'hash001', '2025-10-15 09:30:00', NULL),
(3, 'Aroma & Blossom', 'Amanda Flores', '09381239812', 'SLU Bakakeng MaryHeights Campus Food Hall', 'aroma.blossom@gmail.com', 'Fresh flowers and aromatic coffee blends. Your perfect spot for specialty drinks and floral-inspired desserts.', '15 mins', '2nd Floor, Food Hall Section A', 'permit_aroma_002.pdf', 'aroma_blossom.png', 'Approved', NULL, 'hash002', '2025-11-02 14:20:00', NULL),
(4, 'On The Go Cafe', 'John Reyes', '09981234566', 'SLU Bakakeng MaryHeights Campus Food Hall', 'onthegocafe.slu@gmail.com', 'Quick bites and energizing beverages for students on the move. Perfect for busy schedules.', '10 mins', '1st Floor, Food Hall Near Entrance', 'permit_otg_003.pdf', 'on_the_go.png', 'Pending', NULL, 'hash003', '2025-11-18 11:45:00', NULL),
(5, 'Mayo\'s Cup', 'Carlo Mendoza', '09192345678', 'SLU Bakakeng MaryHeights Campus Food Hall', 'mayoscup.ph@gmail.com', 'Premium coffee and refreshing beverages. Crafted with care for the perfect cup every time.', '12 mins', '2nd Floor, Food Hall Section B', 'permit_mayos_004.pdf', 'mayos_cup.png', 'Approved', NULL, 'hash004', '2025-12-01 08:10:00', NULL),
(6, 'Emerson Canteen', 'Emerson Lao', '09275678912', 'SLU Bakakeng MaryHeights Campus Canteen', 'emersoncanteen@gmail.com', 'Traditional Filipino home-cooked meals. Affordable and delicious comfort food.', '10 mins', '1st Floor, Main Canteen Area', 'permit_emerson_005.pdf', 'emerson_canteen.png', 'Rejected', 'Incomplete business documents', 'hash005', '2025-11-25 16:00:00', NULL),
(7, 'Chickaboo', 'Rina Javier', '09451234789', 'SLU Bakakeng MaryHeights Campus Food Hall', 'chickaboo.ph@gmail.com', 'Crispy fried chicken and Korean-inspired flavors. Satisfying meals that hit the spot.', '15 mins', '2nd Floor, Food Hall Section C', 'permit_chickaboo_006.pdf', 'chickaboo.png', 'Approved', NULL, 'hash006', '2025-11-26 13:50:00', NULL),
(8, 'Lasa Brew Coffee', 'Miguel Santos', '09123987654', 'SLU Bakakeng MaryHeights Campus Food Hall', 'lasabrew@gmail.com', 'Locally roasted coffee beans. Experience authentic Filipino coffee culture.', '8 mins', '1st Floor, Food Hall Corner', 'permit_lasa_007.pdf', 'default.png', 'Pending', NULL, 'hash007', '2025-11-28 10:15:00', NULL),
(9, 'The Spice Route', 'Priya Sharma', '09567123456', 'SLU Bakakeng MaryHeights Campus Canteen', 'spiceroute.slu@gmail.com', 'Authentic Indian cuisine with aromatic spices. From mild to spicy, we have it all.', '20 mins', '2nd Floor, Canteen Wing B', 'permit_spice_008.pdf', 'default.png', 'Approved', NULL, 'hash008', '2025-11-20 15:30:00', NULL),
(10, 'Bubble Bliss', 'Sarah Kim', '09876543210', 'SLU Bakakeng MaryHeights Campus Food Hall', 'bubblebliss.ph@gmail.com', 'Premium milk tea and fruit tea selections. Fresh ingredients, perfect pearls.', '10 mins', '1st Floor, Food Hall Near Stairs', 'permit_bubble_009.pdf', 'default.png', 'Pending', NULL, 'hash009', '2025-12-02 09:00:00', NULL),
(11, 'The Grill House', 'Victor Reyes', '09234567890', 'SLU Bakakeng MaryHeights Campus Canteen', 'grillhouse.slu@gmail.com', 'Grilled meats and BBQ specialties. Smoky flavors and hearty portions.', '25 mins', '3rd Floor, Canteen Outdoor Area', 'permit_grill_010.pdf', 'default.png', 'Rejected', 'Business permit expired', 'hash010', '2025-11-27 13:45:00', NULL),
(12, 'Vegan Vibes', 'Elena Garcia', '09345678901', 'SLU Bakakeng MaryHeights Campus Food Hall', 'veganvibes@gmail.com', 'Plant-based meals that are both healthy and delicious. Sustainable dining options.', '15 mins', '2nd Floor, Food Hall Section D', 'permit_vegan_011.pdf', 'default.png', 'Approved', NULL, 'hash011', '2025-11-19 11:20:00', NULL),
(13, 'Sushi Supreme', 'Takeshi Yamamoto', '09456789012', 'SLU Bakakeng MaryHeights Campus Food Hall', 'sushi.supreme@gmail.com', 'Fresh Japanese cuisine and sushi rolls. Authentic taste of Japan in every bite.', '18 mins', '2nd Floor, Food Hall Premium Section', 'permit_sushi_012.pdf', 'default.png', 'Pending', NULL, 'hash012', '2025-12-03 14:10:00', NULL);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
