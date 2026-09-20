UPDATE store_settings
SET value_json = '"Shop By Categories"'
WHERE setting_group = 'homepage'
  AND setting_key = 'groups_title';
