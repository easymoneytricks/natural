UPDATE store_settings
SET value_json = '"Shop by product group."'
WHERE setting_group = 'homepage'
  AND setting_key = 'category_title';

UPDATE store_settings
SET value_json = '"Explore all groups"'
WHERE setting_group = 'homepage'
  AND setting_key = 'category_link_label';

UPDATE store_settings
SET value_json = '5'
WHERE setting_group = 'homepage_limits'
  AND setting_key = 'category_highlights_desktop';
