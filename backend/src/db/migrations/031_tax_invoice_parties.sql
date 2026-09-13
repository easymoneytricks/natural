ALTER TABLE orders
  ADD COLUMN seller_legal_name VARCHAR(255) NULL AFTER seller_gstin,
  ADD COLUMN seller_address TEXT NULL AFTER seller_legal_name,
  ADD COLUMN seller_state_code CHAR(2) NULL AFTER seller_address,
  ADD COLUMN place_of_supply VARCHAR(120) NULL AFTER seller_state_code,
  ADD COLUMN reverse_charge TINYINT(1) NOT NULL DEFAULT 0 AFTER place_of_supply;

INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('tax', 'default_rate', '18', 1),
  ('tax', 'tax_label', '"GST"', 1),
  ('tax', 'seller_legal_name', '"Natural Beauty"', 0),
  ('tax', 'seller_address', '"Update registered business address"', 0),
  ('tax', 'seller_state_code', '"29"', 0),
  ('tax', 'reverse_charge', 'false', 0)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
