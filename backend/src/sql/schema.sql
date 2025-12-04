-- ==============================
-- CƠ SỞ DỮ LIỆU WEBSITE BÁN LAPTOP CŨ
-- ==============================

CREATE DATABASE IF NOT EXISTS laptopcu DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laptopcu;
-- English table names, Vietnamese column names

-- ==============================
-- 1 USERS
-- ==============================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  ten VARCHAR(255) NOT NULL,
  mat_khau VARCHAR(255) NOT NULL,
  vai_tro ENUM('admin','staff','customer') NOT NULL DEFAULT 'customer',
  dien_thoai VARCHAR(30) NOT NULL,
  dia_chi TEXT NOT NULL,
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================
-- 2 CATEGORIES
-- ==============================
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ten VARCHAR(150) NOT NULL,
  danh_muc_cha_id INT UNSIGNED DEFAULT NULL,
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (danh_muc_cha_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 3 PRODUCTS
-- ==============================
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  danh_muc_id INT UNSIGNED NOT NULL,
  tieu_de VARCHAR(255) NOT NULL,
  mo_ta TEXT,
  ram VARCHAR(50) DEFAULT NULL,
  o_cung VARCHAR(100) DEFAULT NULL,
  cpu VARCHAR(150) DEFAULT NULL,
  kich_thuoc_man_hinh VARCHAR(50) DEFAULT NULL,
  card_do_hoa VARCHAR(150) DEFAULT NULL,
  mau_sac ENUM('den', 'bac', 'xam', 'trang', 'do', 'xanh') DEFAULT NULL,
  do_phan_giai VARCHAR(50) DEFAULT NULL,
  tinh_trang ENUM('like_new','good','fair','poor') NOT NULL DEFAULT 'good',
  gia DECIMAL(12,2) NOT NULL,
  tien_te CHAR(3) DEFAULT 'VND',
  so_luong INT UNSIGNED DEFAULT 1,
  trang_thai ENUM('available','sold','hidden') DEFAULT 'available',
  dang_tai_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (danh_muc_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_gia (gia),
  INDEX idx_danh_muc (danh_muc_id),
  INDEX idx_ram (ram)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 4 PRODUCT_IMAGES
-- ==============================
CREATE TABLE IF NOT EXISTS product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  san_pham_id INT UNSIGNED NOT NULL,
  duong_dan VARCHAR(1000) NOT NULL,
  la_chinh TINYINT(1) DEFAULT 0,
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (san_pham_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TRIGGER IF EXISTS tr_product_images_before_insert;
DROP TRIGGER IF EXISTS tr_product_images_before_update;
-- Trigger: prevent >5 images per product
DELIMITER $$
CREATE TRIGGER tr_product_images_before_insert
BEFORE INSERT ON product_images
FOR EACH ROW
BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt FROM product_images WHERE san_pham_id = NEW.san_pham_id;
  IF cnt >= 5 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum 5 images allowed per product';
  END IF;
END$$

CREATE TRIGGER tr_product_images_before_update
BEFORE UPDATE ON product_images
FOR EACH ROW
BEGIN
  DECLARE cnt INT;
  IF NEW.san_pham_id <> OLD.san_pham_id THEN
    SELECT COUNT(*) INTO cnt FROM product_images WHERE san_pham_id = NEW.san_pham_id;
    IF cnt >= 5 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum 5 images allowed per product';
    END IF;
  END IF;
END$$
DELIMITER ;

-- ==============================
-- 5 ORDERS
-- ==============================
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  khach_hang_id INT UNSIGNED NOT NULL, -- buyer
  tong_tien DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tien_te CHAR(3) DEFAULT 'VND',
  trang_thai ENUM('pending','paid','processing','shipped','completed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  dia_chi_giao_hang TEXT,
  phuong_thuc_thanh_toan VARCHAR(100),
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (khach_hang_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orders_user (khach_hang_id),
  INDEX idx_orders_status (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 6 ORDER_ITEMS
-- ==============================
CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  don_hang_id INT UNSIGNED NOT NULL,
  san_pham_id INT UNSIGNED NOT NULL,
  so_luong INT UNSIGNED NOT NULL DEFAULT 1,
  don_gia DECIMAL(12,2) NOT NULL,
  thanh_tien DECIMAL(12,2) NOT NULL,
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (don_hang_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (san_pham_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_items_order (don_hang_id),
  INDEX idx_order_items_product (san_pham_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 7 REVIEWS
-- ==============================
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  san_pham_id INT UNSIGNED NOT NULL,
  khach_hang_id INT UNSIGNED NOT NULL,
  diem TINYINT UNSIGNED NOT NULL CHECK (diem BETWEEN 1 AND 5),
  tieu_de VARCHAR(255),
  noi_dung TEXT,
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (san_pham_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (khach_hang_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_review_user_product (san_pham_id, khach_hang_id),
  INDEX idx_reviews_product (san_pham_id),
  INDEX idx_reviews_user (khach_hang_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 8 WISHLISTS
-- ==============================
CREATE TABLE IF NOT EXISTS wishlists (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  khach_hang_id INT UNSIGNED NOT NULL,
  san_pham_id INT UNSIGNED NOT NULL,
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (khach_hang_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (san_pham_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_wishlist_user_product (khach_hang_id, san_pham_id),
  INDEX idx_wishlist_user (khach_hang_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 9 BANNERS
-- ==============================
CREATE TABLE IF NOT EXISTS banners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tieu_de VARCHAR(255) NOT NULL,
  duong_dan VARCHAR(1000) NOT NULL,
  link VARCHAR(500) DEFAULT NULL,
  vi_tri INT UNSIGNED DEFAULT 0,
  trang_thai ENUM('active','inactive') DEFAULT 'active',
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_banners_status (trang_thai),
  INDEX idx_banners_position (vi_tri)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 10 CHAT_MESSAGES (live chat)
-- Real-time chat between customers and support staff
-- ==============================
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED DEFAULT NULL,
  noi_dung TEXT NOT NULL,
  ten_nguoi_gui VARCHAR(255) DEFAULT NULL,
  email_nguoi_gui VARCHAR(255) DEFAULT NULL,
  la_nguoi_dung TINYINT(1) DEFAULT 1,
  tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_chat_user (user_id),
  INDEX idx_chat_email (email_nguoi_gui),
  INDEX idx_chat_time (tao_luc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
