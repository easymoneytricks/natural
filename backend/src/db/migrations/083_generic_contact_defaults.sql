UPDATE store_settings
SET value_json = '"support@example.com"'
WHERE setting_group = 'contact' AND setting_key IN ('email', 'support_email')
  AND value_json = '"hello@naturalbeauty.example"';

UPDATE store_settings
SET value_json = '"Store support"'
WHERE setting_group = 'contact' AND setting_key = 'address_name'
  AND value_json = '"Natural Beauty Studio"';
