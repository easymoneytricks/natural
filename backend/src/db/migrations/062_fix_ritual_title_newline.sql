UPDATE store_settings
SET value_json = JSON_QUOTE('Small rituals.\nBeautiful consistency.')
WHERE setting_group = 'homepage'
  AND setting_key = 'ritual_title';
