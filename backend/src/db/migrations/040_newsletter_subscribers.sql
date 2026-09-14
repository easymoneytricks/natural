CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(320) NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  status ENUM('subscribed', 'unsubscribed') NOT NULL DEFAULT 'subscribed',
  source VARCHAR(40) NOT NULL DEFAULT 'storefront',
  subscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_newsletter_email (email),
  KEY idx_newsletter_status (status),
  KEY idx_newsletter_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
