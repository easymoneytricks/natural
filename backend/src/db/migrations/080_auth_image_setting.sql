INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES ('branding', 'auth_image_url', '""', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
