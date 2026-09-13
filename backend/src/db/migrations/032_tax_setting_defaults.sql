INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('tax', 'default_rate', '18', 1),
  ('tax', 'tax_label', '"GST"', 1),
  ('tax', 'enabled', 'false', 1),
  ('tax', 'pricing_mode', '"exclusive"', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
