-- NaturalBeauty consolidated live migration bundle 084 through 087.
-- Run once on a database where these four migrations have not been applied.
-- This file is intentionally kept outside src/db/migrations so the normal
-- development migration history remains unchanged.

-- 084: Gift-card CMS page
INSERT INTO content_pages (
  slug,
  title,
  eyebrow,
  intro,
  content_json,
  seo_title,
  seo_description,
  status,
  published_at
)
SELECT
  'gift-cards',
  'Gift Cards For Thoughtful Care.',
  'GIVE SOMETHING THOUGHTFUL',
  'Let someone choose the products that feel right for them. Gift cards are ideal for birthdays, milestones and everyday acts of care. ',
  JSON_ARRAY(
    JSON_ARRAY('Choose a considered amount', 'Gift cards are available in flexible values from 500. Our team can help you choose an amount that suits a complete order or a single favourite product.'),
    JSON_ARRAY('How it works', 'Contact our team with the recipient name, email address and value you would like to gift. We will issue a secure code and share it with you after payment is confirmed.'),
    JSON_ARRAY('Simple to redeem', 'The recipient can enter their gift card code in the cart at checkout. Any remaining balance stays available for a future order until the card expires.'),
    JSON_ARRAY('Need help choosing?', 'Our team is available during support hours. Reach out through Contact Us and we will make gifting feel effortless.')
  ),
  'Gift Cards',
  'Give a flexible gift card for products from our store.',
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'gift-cards');

-- 085: Gift-card purchase records and default denominations
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

-- 086: Ensure every existing SKU has an inventory row
INSERT INTO inventory (sku_id)
SELECT s.id
FROM product_skus s
LEFT JOIN inventory i ON i.sku_id = s.id
WHERE i.sku_id IS NULL;

-- 087: Configurable order-number format and sequence counter
CREATE TABLE IF NOT EXISTS order_number_counters (
  counter_key VARCHAR(40) NOT NULL,
  next_value BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (counter_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES ('store', 'order_number_format', '"NB-{YYYY}-{SEQ:6}"', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);

INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES ('store', 'order_sequence_start', '1', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
