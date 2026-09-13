INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('footer', 'instagram_url', '""', 1),
  ('footer', 'facebook_url', '""', 1),
  ('footer', 'youtube_url', '""', 1),
  ('footer', 'pinterest_url', '""', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
