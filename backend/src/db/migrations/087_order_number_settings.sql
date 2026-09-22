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
