INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'routine_eyebrow', '"Find your routine"', 1),
  ('homepage', 'routine_title', JSON_QUOTE('Your products.\nYour preferences.\nYour choice.'), 1),
  ('homepage', 'routine_description', '"Start with what you need today and discover products that fit naturally into your routine."', 1),
  ('homepage', 'routine_step_1', '"Choose a product group"', 1),
  ('homepage', 'routine_step_2', '"Choose your preference"', 1),
  ('homepage', 'routine_step_3', '"Discover your selection"', 1),
  ('homepage', 'routine_link_label', '"Explore products"', 1),
  ('homepage', 'routine_link_url', '"/shop"', 1),
  ('homepage', 'routine_secondary_label', '"Shop all products"', 1),
  ('homepage', 'routine_secondary_url', '"/shop"', 1),
  ('homepage', 'routine_image_url', '"local:hero"', 1),
  ('homepage', 'routine_image_alt', '"Unbranded products arranged on natural stone"', 1);
