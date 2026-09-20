INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'featured_eyebrow', '"Most loved"', 1),
  ('homepage', 'featured_title', '"The best of Natural Beauty"', 1),
  ('homepage', 'featured_description', '"Customer favourites selected from the full collection."', 1),
  ('homepage', 'featured_link_label', '"View all products"', 1),
  ('homepage', 'featured_link_url', '"/shop"', 1);
