INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES (
  'store',
  'closed_message',
  '"Ordering is temporarily paused · You can still browse our products."',
  1
);
