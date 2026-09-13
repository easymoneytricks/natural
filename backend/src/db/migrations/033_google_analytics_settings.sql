INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('analytics', 'enabled', 'false', 1),
  ('analytics', 'measurement_id', '""', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
