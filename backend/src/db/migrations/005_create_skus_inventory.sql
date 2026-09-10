CREATE TABLE IF NOT EXISTS product_skus (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  sku VARCHAR(150) NOT NULL,
  title VARCHAR(255) NULL,
  combination_key VARCHAR(500) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  mrp DECIMAL(12,2) NOT NULL,
  barcode VARCHAR(100) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  track_inventory TINYINT(1) NOT NULL DEFAULT 1,
  allow_backorder TINYINT(1) NOT NULL DEFAULT 0,
  weight_grams INT UNSIGNED NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_skus_sku (sku),
  UNIQUE KEY uq_product_skus_combination (product_id, combination_key),
  UNIQUE KEY uq_product_skus_barcode (barcode),
  KEY idx_product_skus_product (product_id),
  KEY idx_product_skus_active (is_active),
  CONSTRAINT fk_product_skus_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_product_skus_prices CHECK (price >= 0 AND mrp >= price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sku_attribute_values (
  sku_id BIGINT UNSIGNED NOT NULL,
  attribute_id BIGINT UNSIGNED NOT NULL,
  attribute_value_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (sku_id, attribute_id),
  UNIQUE KEY uq_sku_attribute_value (sku_id, attribute_value_id),
  KEY idx_sku_attribute_values_attribute (attribute_id),
  KEY idx_sku_attribute_values_value (attribute_value_id),
  CONSTRAINT fk_sku_attribute_values_sku FOREIGN KEY (sku_id) REFERENCES product_skus (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sku_attribute_values_attribute FOREIGN KEY (attribute_id) REFERENCES attributes (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sku_attribute_values_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku_id BIGINT UNSIGNED NOT NULL,
  quantity_on_hand INT UNSIGNED NOT NULL DEFAULT 0,
  reserved_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  reorder_level INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_inventory_sku (sku_id),
  CONSTRAINT fk_inventory_sku FOREIGN KEY (sku_id) REFERENCES product_skus (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_inventory_reserved CHECK (reserved_quantity <= quantity_on_hand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku_id BIGINT UNSIGNED NOT NULL,
  movement_type ENUM('initial', 'adjustment', 'sale', 'return', 'reservation', 'release', 'cancellation') NOT NULL,
  quantity_change INT NOT NULL,
  quantity_before INT UNSIGNED NOT NULL,
  quantity_after INT UNSIGNED NOT NULL,
  reference_type VARCHAR(50) NULL,
  reference_id BIGINT UNSIGNED NULL,
  note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inventory_movements_sku (sku_id),
  KEY idx_inventory_movements_created (created_at),
  CONSTRAINT fk_inventory_movements_sku FOREIGN KEY (sku_id) REFERENCES product_skus (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sku_media (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku_id BIGINT UNSIGNED NOT NULL,
  product_media_id BIGINT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sku_media (sku_id, product_media_id),
  CONSTRAINT fk_sku_media_sku FOREIGN KEY (sku_id) REFERENCES product_skus (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sku_media_product_media FOREIGN KEY (product_media_id) REFERENCES product_media (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
