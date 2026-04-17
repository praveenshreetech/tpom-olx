-- ============================================================
-- CLEAN MARKETPLACE DATABASE (FINAL VERSION)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ========================
-- DROP OLD TABLES (SAFE)
-- ========================
DROP VIEW IF EXISTS vw_active_products, vw_new_submissions, vw_new_inquiries;

DROP TABLE IF EXISTS product_images, inquiries, seller_submissions, products, categories, admins;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================
-- 1. ADMINS
-- ========================
CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- 2. CATEGORIES
-- ========================
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- 3. PRODUCTS
-- ========================
CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NULL,

  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) DEFAULT 0.00,
  location VARCHAR(150),

  -- SELLER DETAILS (IMPORTANT)
  seller_name VARCHAR(150),
  seller_phone VARCHAR(50),
  seller_whatsapp VARCHAR(50),

  status ENUM('active','sold','hidden') DEFAULT 'active',
  views_count INT UNSIGNED DEFAULT 0,

  -- VEHICLE SPECIFIC FIELDS
  model VARCHAR(100),
  ownership VARCHAR(50),
  year INT,
  kilometers INT,
  expected_price DECIMAL(12,2),

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

  INDEX idx_product_status (status),
  INDEX idx_product_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- 4. PRODUCT IMAGES
-- ========================
CREATE TABLE product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,

  image_url VARCHAR(500) NOT NULL,
  is_primary TINYINT(1) DEFAULT 0,
  sort_order TINYINT DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

  INDEX idx_product_images (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- 5. SELLER SUBMISSIONS
-- ========================
CREATE TABLE seller_submissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  seller_name VARCHAR(100) NOT NULL,
  seller_phone VARCHAR(20) NOT NULL,
  seller_whatsapp VARCHAR(20),
  seller_email VARCHAR(150),

  product_title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  location VARCHAR(150),

  image_urls TEXT,

  contact_method ENUM('whatsapp','form') DEFAULT 'form',
  status ENUM('new','reviewed','posted','rejected') DEFAULT 'new',

  admin_notes TEXT,

  -- VEHICLE SPECIFIC FIELDS
  model VARCHAR(100),
  ownership VARCHAR(50),
  year INT,
  kilometers INT,
  expected_price DECIMAL(12,2),
  category_id INT UNSIGNED NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_submission_status (status),
  INDEX idx_submission_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- 6. INQUIRIES
-- ========================
CREATE TABLE inquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,

  buyer_name VARCHAR(100) NOT NULL,
  buyer_phone VARCHAR(20),
  buyer_email VARCHAR(150),

  message TEXT NOT NULL,

  contact_method ENUM('whatsapp','form') DEFAULT 'form',
  status ENUM('new','contacted','closed') DEFAULT 'new',

  admin_notes TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

  INDEX idx_inquiry_product (product_id),
  INDEX idx_inquiry_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- 7. BANNERS
-- ========================
CREATE TABLE banners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500),
  title VARCHAR(200),
  sort_order TINYINT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- SEED DATA
-- ========================
INSERT INTO admins (name, email, password_hash)
VALUES ('Admin', 'admin@tpom.com', 'CHANGE_WITH_HASH');

INSERT INTO categories (name, slug) VALUES
('Cars', 'cars'),
('Bikes', 'bikes'),
('Home Appliances', 'home-appliances'),
('Real Estate', 'real-estate');

-- ========================
-- VIEWS
-- ========================
CREATE VIEW vw_active_products AS
SELECT
  p.id,
  p.title,
  p.description,
  p.price,
  p.location,
  p.seller_name,
  p.seller_phone,
  p.views_count,
  p.created_at,
  c.name AS category,

  (SELECT image_url FROM product_images
   WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,

  p.model,
  p.ownership,
  p.year,
  p.kilometers,
  p.expected_price

FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.status = 'active'
ORDER BY p.created_at DESC;

CREATE VIEW vw_new_submissions AS
SELECT
  id,
  seller_name,
  seller_phone,
  product_title,
  price,
  location,
  status,
  created_at
FROM seller_submissions
WHERE status = 'new'
ORDER BY created_at ASC;

CREATE VIEW vw_new_inquiries AS
SELECT
  i.id,
  i.buyer_name,
  i.message,
  i.status,
  i.created_at,
  p.title AS product_title
FROM inquiries i
JOIN products p ON p.id = i.product_id
WHERE i.status = 'new'
ORDER BY i.created_at ASC;