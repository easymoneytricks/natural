INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('store', 'availability_title', '"We are getting ready"', 1),
  ('store', 'availability_message', '"Our store will be available soon. Please check back shortly."', 1),
  ('store', 'availability_countdown', '""', 1),
  ('store', 'maintenance_title', '"We will be back shortly"', 1),
  ('store', 'maintenance_message', '"We are making a few improvements. Please check back soon."', 1);
