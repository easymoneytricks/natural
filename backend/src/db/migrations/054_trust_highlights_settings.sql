INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('trust', 'item_1_title', '"Thoughtful formulas"', 1),
  ('trust', 'item_1_text', '"Made for everyday skin rituals"', 1),
  ('trust', 'item_2_title', '"Skin-first care"', 1),
  ('trust', 'item_2_text', '"Solutions organized around your needs"', 1),
  ('trust', 'item_3_title', '"Secure checkout"', 1),
  ('trust', 'item_3_text', '"Protected and straightforward"', 1),
  ('trust', 'item_4_title', '"Complimentary shipping"', 1),
  ('trust', 'item_4_text', '"On orders above ₹999"', 1);
