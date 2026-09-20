INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'ingredients_image_url', '"local:hero"', 1),
  ('homepage', 'ingredients_image_alt', '"Products and materials arranged for a considered routine"', 1),
  ('homepage', 'highlight_1_title', '"Vitamin C"', 1),
  ('homepage', 'highlight_1_text', '"For brighter-looking, more radiant skin"', 1),
  ('homepage', 'highlight_2_title', '"Niacinamide"', 1),
  ('homepage', 'highlight_2_text', '"Supports balance and smoother-looking texture"', 1),
  ('homepage', 'highlight_3_title', '"Hyaluronic Acid"', 1),
  ('homepage', 'highlight_3_text', '"Helps maintain skin hydration"', 1),
  ('homepage', 'highlight_4_title', '"Ceramides"', 1),
  ('homepage', 'highlight_4_text', '"Supports the skin''s moisture barrier"', 1),
  ('homepage', 'highlight_5_title', '"Salicylic Acid"', 1),
  ('homepage', 'highlight_5_text', '"Helps clarify congested-looking skin"', 1),
  ('homepage', 'highlight_6_title', '"Retinol"', 1),
  ('homepage', 'highlight_6_text', '"Supports smoother, renewed-looking skin"', 1);

UPDATE store_settings
SET value_json = '"Details with intention"'
WHERE setting_group = 'homepage' AND setting_key = 'ingredients_eyebrow';

UPDATE store_settings
SET value_json = '"Details that make a difference."'
WHERE setting_group = 'homepage' AND setting_key = 'ingredients_title';

UPDATE store_settings
SET value_json = '"Explore the qualities and benefits behind each product."'
WHERE setting_group = 'homepage' AND setting_key = 'ingredients_description';
