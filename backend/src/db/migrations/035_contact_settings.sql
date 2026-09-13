INSERT INTO store_settings (setting_group, setting_key, value_json, is_public)
VALUES
  ('contact', 'eyebrow', '"We would love to hear from you"', 1),
  ('contact', 'title', '"Let’s make your routine feel simple."', 1),
  ('contact', 'intro', '"Questions about a product, an order or finding your next formula? Our care team is here Monday–Saturday, 10:00 AM–6:00 PM."', 1),
  ('contact', 'email', '"hello@naturalbeauty.example"', 1),
  ('contact', 'phone', '"+91 98765 43210"', 1),
  ('contact', 'address_name', '"Natural Beauty Studio"', 1),
  ('contact', 'address_line', '"Indiranagar, Bengaluru 560038"', 1),
  ('contact', 'hours', '"Monday–Saturday, 10:00 AM–6:00 PM"', 1),
  ('contact', 'map_url', '"https://www.openstreetmap.org/export/embed.html?bbox=77.625%2C12.965%2C77.645%2C12.985&layer=mapnik&marker=12.975%2C77.635"', 1)
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);
