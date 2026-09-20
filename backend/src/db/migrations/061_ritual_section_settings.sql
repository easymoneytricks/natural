INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'ritual_eyebrow', '"The daily ritual"', 1),
  ('homepage', 'ritual_title', '"Small rituals.\nBeautiful consistency."', 1),
  ('homepage', 'ritual_description', '"Build a simple routine for morning, evening and everything in between."', 1),
  ('homepage', 'ritual_link_label', '"Build your routine"', 1),
  ('homepage', 'ritual_link_url', '"/shop"', 1),
  ('homepage', 'ritual_image_url', '"local:hero"', 1),
  ('homepage', 'ritual_image_alt', '"A calm botanical skincare ritual arranged on stone"', 1);
