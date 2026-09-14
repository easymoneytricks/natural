INSERT INTO content_pages (
  slug,
  title,
  eyebrow,
  intro,
  content_json,
  seo_title,
  seo_description,
  status,
  published_at
)
SELECT
  'journal',
  'The Natural Beauty Journal',
  'THE NATURAL BEAUTY JOURNAL',
  'Thoughtful notes on skincare, ingredients and everyday rituals—made simple, useful and easy to return to.',
  JSON_ARRAY(
    JSON_ARRAY('Build a routine that lasts', 'A good routine is less about having more products and more about choosing a few formulas you can use consistently. Start with a gentle cleanser, add targeted care when you need it, and finish with moisturiser and daily SPF.'),
    JSON_ARRAY('How to read an ingredient list', 'Look for the ingredients your skin already responds well to, then introduce one new active at a time. Give your routine a little patience: comfort, balance and steady progress matter more than overnight promises.'),
    JSON_ARRAY('The essential morning ritual', 'Cleanse or rinse, hydrate, protect and go. Lightweight layers help your skin feel comfortable through the day, while broad-spectrum sunscreen is the most dependable step for protecting your results.'),
    JSON_ARRAY('Care for a calm evening', 'Evenings are a chance to reset. Remove the day gently, apply your chosen treatment, and seal in moisture. Keep the ritual unhurried so skincare feels like care rather than another task.'),
    JSON_ARRAY('Small habits, visible difference', 'Fresh pillowcases, clean hands, regular hydration and a little consistency can support the formulas you already own. Your skin does not need perfection—it needs thoughtful repetition.')
  ),
  'The Natural Beauty Journal | Skincare notes and rituals',
  'Read practical skincare guidance, ingredient notes and simple rituals from Natural Beauty.',
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'journal');
