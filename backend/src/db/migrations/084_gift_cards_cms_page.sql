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
  'gift-cards',
  'Gift Cards For Thoughtful Care.',
  'GIVE SOMETHING THOUGHTFUL',
  'Let someone choose the products that feel right for them. Gift cards are ideal for birthdays, milestones and everyday acts of care.',
  JSON_ARRAY(
    JSON_ARRAY('Choose a considered amount', 'Gift cards are available in flexible values from ₹500. Our team can help you choose an amount that suits a complete order or a single favourite product.'),
    JSON_ARRAY('How it works', 'Contact our team with the recipient name, email address and value you would like to gift. We will issue a secure code and share it with you after payment is confirmed.'),
    JSON_ARRAY('Simple to redeem', 'The recipient can enter their gift card code in the cart at checkout. Any remaining balance stays available for a future order until the card expires.'),
    JSON_ARRAY('Need help choosing?', 'Our team is available during support hours. Reach out through Contact Us and we will make gifting feel effortless.')
  ),
  'Gift Cards',
  'Give a flexible gift card for products from our store.',
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'gift-cards');
