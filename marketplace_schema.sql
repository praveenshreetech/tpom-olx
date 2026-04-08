-- ============================================================
--  Marketplace Database Schema (Simplified)
--  No seller login. Sellers contact admin via form/WhatsApp.
--  Admin posts products and manages inquiries.
-- ============================================================

CREATE DATABASE IF NOT EXISTS marketplace_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE marketplace_db;

-- ============================================================
-- 1. ADMIN USERS
-- ============================================================
CREATE TABLE admins (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name  VARCHAR(100) NOT NULL UNIQUE,
  slug  VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- 3. PRODUCTS
--    Admin creates and manages all product listings
-- ============================================================
CREATE TABLE products (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  category_id  INT UNSIGNED       NULL,
  title        VARCHAR(200)   NOT NULL,
  description  TEXT               NULL,
  price        DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  location     VARCHAR(150)       NULL,
  status       ENUM('active','sold','hidden') NOT NULL DEFAULT 'active',
  views_count  INT UNSIGNED   NOT NULL DEFAULT 0,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_product_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_product_status   (status),
  INDEX idx_product_category (category_id)
) ENGINE=InnoDB;

-- ============================================================
-- 4. PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  is_primary  TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order  TINYINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_image_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_image_product (product_id)
) ENGINE=InnoDB;

-- ============================================================
-- 5. SELLER SUBMISSIONS
--    Sellers fill the form → stored here → admin reviews
--    Admin then decides to post as a product listing
-- ============================================================
CREATE TABLE seller_submissions (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  seller_name     VARCHAR(100)  NOT NULL,
  seller_phone    VARCHAR(20)   NOT NULL,
  seller_whatsapp VARCHAR(20)       NULL,
  seller_email    VARCHAR(150)      NULL,
  product_title   VARCHAR(200)  NOT NULL,
  description     TEXT              NULL,
  price           DECIMAL(12,2)     NULL,
  location        VARCHAR(150)      NULL,
  image_urls      TEXT              NULL,  -- comma-separated uploaded image paths
  contact_method  ENUM('whatsapp','form') NOT NULL DEFAULT 'form',
  status          ENUM('new','reviewed','posted','rejected')
                                NOT NULL DEFAULT 'new',
  admin_notes     TEXT              NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_submission_status (status),
  INDEX idx_submission_created (created_at DESC)
) ENGINE=InnoDB;

-- ============================================================
-- 6. BUYER INQUIRIES
--    Buyer contacts admin about a listed product
-- ============================================================
CREATE TABLE inquiries (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id     INT UNSIGNED NOT NULL,
  buyer_name     VARCHAR(100) NOT NULL,
  buyer_phone    VARCHAR(20)      NULL,
  buyer_email    VARCHAR(150)     NULL,
  message        TEXT         NOT NULL,
  contact_method ENUM('whatsapp','form') NOT NULL DEFAULT 'form',
  status         ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  admin_notes    TEXT             NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_inquiry_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_inquiry_product (product_id),
  INDEX idx_inquiry_status  (status),
  INDEX idx_inquiry_created (created_at DESC)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO admins (name, email, password_hash) VALUES
  ('Admin', 'admin@marketplace.com', 'CHANGE_THIS_WITH_BCRYPT_HASH');

INSERT INTO categories (name, slug) VALUES
  ('Electronics',  'electronics'),
  ('Vehicles',     'vehicles'),
  ('Furniture',    'furniture'),
  ('Real Estate',  'real-estate'),
  ('Fashion',      'fashion'),
  ('Sports',       'sports'),
  ('Services',     'services');

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW vw_active_products AS
SELECT
  p.id, p.title, p.description, p.price, p.location,
  p.views_count, p.created_at,
  c.name AS category,
  (SELECT image_url FROM product_images
   WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.status = 'active'
ORDER BY p.created_at DESC;

CREATE OR REPLACE VIEW vw_new_submissions AS
SELECT id, seller_name, seller_phone, seller_whatsapp,
       product_title, price, location, contact_method, status, created_at
FROM seller_submissions
WHERE status = 'new'
ORDER BY created_at ASC;

CREATE OR REPLACE VIEW vw_new_inquiries AS
SELECT i.id, i.buyer_name, i.buyer_phone, i.message,
       i.contact_method, i.status, i.created_at,
       p.title AS product_title, p.price AS product_price
FROM inquiries i
JOIN products p ON p.id = i.product_id
WHERE i.status = 'new'
ORDER BY i.created_at ASC;
