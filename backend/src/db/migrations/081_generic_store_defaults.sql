UPDATE store_settings
SET value_json = '"Your store"'
WHERE setting_group = 'store'
  AND setting_key = 'store_name'
  AND value_json = '"Natural Beauty"';

UPDATE store_settings
SET value_json = '"Your store"'
WHERE setting_group = 'seo'
  AND setting_key = 'site_title'
  AND value_json = '"Natural Beauty"';

UPDATE store_settings
SET value_json = '"Thoughtfully made products for everyday use."'
WHERE setting_group = 'seo'
  AND setting_key = 'meta_description'
  AND value_json = '"Thoughtfully formulated skincare for everyday rituals."';

UPDATE store_settings
SET value_json = '"Your store"'
WHERE setting_group = 'smtp'
  AND setting_key = 'from_name'
  AND value_json = '"Natural Beauty"';

UPDATE store_settings
SET value_json = '"Your store"'
WHERE setting_group = 'tax'
  AND setting_key = 'seller_legal_name'
  AND value_json = '"Natural Beauty"';
