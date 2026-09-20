INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'brand_image_url', '"local:hero"', 1),
  ('homepage', 'brand_image_alt', '"Botanical skincare bottles in soft natural light"', 1),
  ('homepage', 'brand_note_title', '"Formulated with purpose"', 1),
  ('homepage', 'brand_note_text', '"Designed around skin needs, texture and everyday usability."', 1);
