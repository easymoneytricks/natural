CREATE TABLE IF NOT EXISTS gift_card_purchases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NULL,
  recipient_name VARCHAR(255) NULL,
  message VARCHAR(500) NULL,
  delivery_mode ENUM('self','gift') NOT NULL DEFAULT 'self',
  code_encrypted TEXT NULL,
  gift_card_id BIGINT UNSIGNED NULL,
  issued_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_gift_card_purchase_order (order_id),
  KEY idx_gift_card_purchase_card (gift_card_id),
  CONSTRAINT fk_gift_card_purchase_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_gift_card_purchase_card FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES ('gift_cards', 'denominations', '[500,1000,2000,5000]', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
