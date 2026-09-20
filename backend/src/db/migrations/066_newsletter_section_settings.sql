INSERT IGNORE INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('homepage', 'newsletter_eyebrow', '"The Natural Beauty note"', 1),
  ('homepage', 'newsletter_title', JSON_QUOTE('A little more care,\ndelivered to your inbox.'), 1),
  ('homepage', 'newsletter_description', '"New formulas, thoughtful skincare notes, early access and occasional offers — without the noise."', 1),
  ('homepage', 'newsletter_label', '"Your email address"', 1),
  ('homepage', 'newsletter_placeholder', '"Your email address"', 1),
  ('homepage', 'newsletter_button_label', '"Join the list"', 1),
  ('homepage', 'newsletter_submitting_label', '"Joining…"', 1),
  ('homepage', 'newsletter_privacy', '"By subscribing, you agree to receive Natural Beauty updates. You can unsubscribe at any time."', 1),
  ('homepage', 'newsletter_success', '"You’re on the list. Welcome to the Natural Beauty note."', 1);
