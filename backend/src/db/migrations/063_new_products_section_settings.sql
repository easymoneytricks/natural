INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'new_eyebrow', '"Just in"', 1),
  ('homepage', 'new_title', '"New to the ritual"', 1),
  ('homepage', 'new_description', '"Fresh additions designed to find an easy place in your everyday routine."', 1),
  ('homepage', 'new_link_label', '"Shop new arrivals"', 1),
  ('homepage', 'new_link_url', '"/new-arrivals"', 1);
