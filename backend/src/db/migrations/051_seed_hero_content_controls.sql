INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'hero_image_url', '"local:hero"', 1),
  ('homepage', 'hero_image_alt', '"Products arranged in soft natural light"', 1),
  ('homepage', 'hero_proof', '"Thoughtfully made · Easy to choose · Made for everyday use"', 1),
  ('homepage', 'hero_ritual_title', '"The daily edit"', 1),
  ('homepage', 'hero_ritual_text', '"Choose · Use · Enjoy · Repeat"', 1);

UPDATE store_settings
SET value_json='"local:hero"'
WHERE setting_group='homepage' AND setting_key='hero_image_url'
  AND value_json IN ('""', 'null');

UPDATE store_settings
SET value_json='"Products arranged in soft natural light"'
WHERE setting_group='homepage' AND setting_key='hero_image_alt'
  AND value_json IN ('""', 'null');

UPDATE store_settings
SET value_json='"Thoughtfully made · Easy to choose · Made for everyday use"'
WHERE setting_group='homepage' AND setting_key='hero_proof'
  AND value_json IN ('""', 'null');

UPDATE store_settings
SET value_json='"The daily edit"'
WHERE setting_group='homepage' AND setting_key='hero_ritual_title'
  AND value_json IN ('""', 'null');

UPDATE store_settings
SET value_json='"Choose · Use · Enjoy · Repeat"'
WHERE setting_group='homepage' AND setting_key='hero_ritual_text'
  AND value_json IN ('""', 'null');
