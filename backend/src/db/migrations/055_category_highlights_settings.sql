INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'category_eyebrow', '"Explore the collection"', 1),
  ('homepage', 'category_title', '"Featured categories"', 1),
  ('homepage', 'category_description', '"Browse products by the way you like to shop."', 1),
  ('homepage', 'category_link_label', '"View all categories"', 1),
  ('homepage', 'category_link_url', '"/shop"', 1);
