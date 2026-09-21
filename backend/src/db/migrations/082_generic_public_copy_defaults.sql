UPDATE store_settings
SET value_json = '"Thoughtfully made products"'
WHERE setting_group = 'branding' AND setting_key = 'announcement_secondary'
  AND value_json = '"Thoughtfully formulated skincare"';

UPDATE store_settings
SET value_json = '"Products, considered."'
WHERE setting_group = 'shop' AND setting_key = 'title'
  AND value_json = '"Skincare, considered."';

UPDATE store_settings
SET value_json = '"Explore products by category, attributes and everyday needs."'
WHERE setting_group = 'shop' AND setting_key = 'description'
  AND value_json LIKE '%skincare%';

UPDATE store_settings
SET value_json = '"Explore products"'
WHERE setting_group = 'contact' AND setting_key = 'cta_label'
  AND value_json = '"Explore skincare"';

UPDATE store_settings
SET value_json = '"Products with purpose"'
WHERE setting_group = 'homepage' AND setting_key = 'brand_title'
  AND value_json = '"Nature, refined by thoughtful formulation."';
