-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 27, 2025 at 12:29 AM
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
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`admin_id`, `username`, `name`, `email`, `mobile_number`, `password_hash`, `created_at`) VALUES
(1, 'admin1', 'John Lloyd Cruz', 'jlloydcruz@slu.edu.ph', '09123456789', '123', '2025-11-27 00:28:27'),
(2, 'admin2', 'Amanda Flores', 'amanda.flores@slu.edu.ph', '09381239812', '456', '2025-11-27 00:28:27');

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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `NAME`, `contact_number`, `email`, `password_hash`, `created_at`) VALUES
(1, 'Heart', '09123456789', 'heartconserva@gmail.com', '123', '2025-11-27 00:28:27'),
(2, 'Nina Padua', '09911132114', 'baby@gmail.com', 'baby', '2025-12-02 22:22:25');

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dummy data for orders
INSERT INTO `orders` (
  `customer_id`, `vendor_id`, `total_price`, `payment_method`, `order_status`, `rejection_reason`, `created_at`
) VALUES
(2, 1, 150.50, 'COD', 'Delivered', NULL, '2025-10-16 10:15:00'),  -- Order from Oval Canteen
(2, 2, 220.00, 'COD', 'Ready', NULL, '2025-11-03 12:45:00'),       -- Order from Aroma & Blossom
(2, 3, 120.75, 'COD', 'Preparing', NULL, '2025-11-18 12:00:00'),    -- Order from On The Go Cafe
(2, 4, 95.25, 'COD', 'Delivered', NULL, '2025-12-01 09:00:00'),     -- Order from Mayo's Cup
(2, 5, 180.00, 'COD', 'Rejected', 'Vendor documents incomplete', '2025-11-26 14:30:00'), -- Order from Emerson Canteen
(2, 6, 200.50, 'COD', 'Delivered', NULL, '2025-11-27 11:20:00');     -- Order from Chickaboo

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
  `image` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `vendor_id` (`vendor_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `vendor_id`, `NAME`, `image`, `description`, `price`, `created_at`) VALUES
(1, 1, 'Fries', 'fries.jpg', 'Crispy golden fries', 50.00, '2025-11-27 00:28:27'),
(2, 2, 'Smoothie', 'smoothie.jpg', 'Mixed fruit smoothie', 70.00, '2025-11-27 00:28:27');

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
  `business_permit` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT 'default.png',
  `STATUS` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `business_name` (`business_name`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (
  `business_name`, `owner_name`, `contact_number`, `address`, `email`,
  `business_permit`, `profile_image`, `STATUS`, `rejection_reason`, `password_hash`, `created_at`
) VALUES
('Oval Canteen', 'Marites Dela Cruz', '09171234567',
 'SLU Bakakeng MaryHeights Campus Canteen',
 'ovalcanteen.slu@gmail.com', 'permit_oval_001.pdf', 'oval_canteen.png',
 'Approved', NULL, 'hash001', '2025-10-15 09:30:00'),
('Aroma & Blossom', 'Amanda Flores', '09381239812',
 'SLU Bakakeng MaryHeights Campus Food Hall',
 'aroma.blossom@gmail.com', 'permit_aroma_002.pdf', 'aroma_blossom.png',
 'Approved', NULL, 'hash002', '2025-11-02 14:20:00'),
('On The Go Cafe', 'John Reyes', '09981234566',
 'SLU Bakakeng MaryHeights Campus Food Hall',
 'onthegocafe.slu@gmail.com', 'permit_otg_003.pdf', 'on_the_go.png',
 'Pending', NULL, 'hash003', '2025-11-18 11:45:00'),
('Mayo''s Cup', 'Carlo Mendoza', '09192345678',
 'SLU Bakakeng MaryHeights Campus Food Hall',
 'mayoscup.ph@gmail.com', 'permit_mayos_004.pdf', 'mayos_cup.png',
 'Approved', NULL, 'hash004', '2025-12-01 08:10:00'),
('Emerson Canteen', 'Emerson Lao', '09275678912',
 'SLU Bakakeng MaryHeights Campus Canteen',
 'emersoncanteen@gmail.com', 'permit_emerson_005.pdf', 'emerson_canteen.png',
 'Rejected', 'Incomplete business documents', 'hash005', '2025-11-25 16:00:00'),
('Chickaboo', 'Rina Javier', '09451234789',
 'SLU Bakakeng MaryHeights Campus Food Hall',
 'chickaboo.ph@gmail.com', 'permit_chickaboo_006.pdf', 'chickaboo.png',
 'Approved', NULL, 'hash006', '2025-11-26 13:50:00'),
('Lasa Brew Coffee', 'Miguel Santos', '09123987654',
 'SLU Bakakeng MaryHeights Campus Food Hall',
 'lasabrew@gmail.com', 'permit_lasa_007.pdf', 'lasa_brew.png',
 'Pending', NULL, 'hash007', '2025-11-28 10:15:00'),
('The Spice Route', 'Priya Sharma', '09567123456',
 'SLU Bakakeng MaryHeights Campus Canteen',
 'spiceroute.slu@gmail.com', 'permit_spice_008.pdf', 'spice_route.png',
 'Approved', NULL, 'hash008', '2025-11-20 15:30:00'),
('Bubble Bliss', 'Sarah Kim', '09876543210',
 'SLU Bakakeng MaryHeights Campus Food Hall',
 'bubblebliss.ph@gmail.com', 'permit_bubble_009.pdf', 'bubble_bliss.png',
 'Pending', NULL, 'hash009', '2025-12-02 09:00:00'),
('The Grill House', 'Victor Reyes', '09234567890',
 'SLU Bakakeng MaryHeights Campus Canteen',
 'grillhouse.slu@gmail.com', 'permit_grill_010.pdf', 'grill_house.png',
 'Rejected', 'Business permit expired', 'hash010', '2025-11-27 13:45:00'),
('Vegan Vibes', 'Elena Garcia', '09345678901',
 'SLU Bakakeng MaryHeights Campus Food Hall',
 'veganvibes@gmail.com', 'permit_vegan_011.pdf', 'vegan_vibes.png',
 'Approved', NULL, 'hash011', '2025-11-19 11:20:00'),
('Sushi Supreme', 'Takeshi Yamamoto', '09456789012',
 'SLU Bakakeng MaryHeights Campus Food Hall',
 'sushi.supreme@gmail.com', 'permit_sushi_012.pdf', 'sushi_supreme.png',
 'Pending', NULL, 'hash012', '2025-12-03 14:10:00');

COMMIT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
