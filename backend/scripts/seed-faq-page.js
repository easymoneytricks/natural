import { pool } from "../src/config/database.js";

const content = [
  [
    "How do I choose the right products for my skin?",
    "Start with your main skin concern, then build a simple routine around a gentle cleanser, a targeted treatment and a moisturiser. If you are new to active ingredients, introduce one product at a time and follow its directions.",
  ],
  [
    "Can I use Natural Beauty products on sensitive skin?",
    "Our formulas are designed for everyday use, but every skin is different. Patch test a new product on a small area first, avoid layering several new actives together and stop using it if irritation occurs. Speak with a dermatologist for persistent concerns.",
  ],
  [
    "How long will my order take to arrive?",
    "We deliver to serviceable addresses across India. Your estimated delivery window and any available tracking details are shown at checkout and sent by email after dispatch. Weather, holidays and carrier capacity can affect an estimate.",
  ],
  [
    "How can I update or cancel my order?",
    "Email hello@naturalbeauty.example with your order number as soon as possible. We can try to make changes before fulfilment or dispatch begins, but a request is confirmed only when our team replies or the order status changes.",
  ],
  [
    "What is your returns policy?",
    "Contact us within 7 days of delivery for an unopened, unused product in its original packaging. Opened or used skincare cannot usually be returned for hygiene reasons. Read our Returns & Exchanges policy for the complete process.",
  ],
  [
    "How do refunds work?",
    "Once an eligible return, cancellation or delivery issue is approved, the refund is initiated to the original payment method where possible. COD refunds use the verified method agreed with our care team. Banks and payment providers may need additional processing time.",
  ],
  [
    "Are your products tested on animals?",
    "Natural Beauty does not commission animal testing for our cosmetic products. We work with ingredient and manufacturing partners who provide safety and compliance documentation for the products we sell.",
  ],
  [
    "How should I store my skincare?",
    "Keep products closed, away from direct sunlight and excessive heat, and use clean, dry hands. Follow the period-after-opening guidance on the packaging and do not use a product if its colour, smell or texture changes unexpectedly.",
  ],
];

await pool.execute(
  `INSERT INTO content_pages (slug,title,eyebrow,intro,content_json,seo_title,seo_description,status,published_at)
   VALUES (?,?,?,?,?,?,?,'published',NOW())
   ON DUPLICATE KEY UPDATE title=VALUES(title),eyebrow=VALUES(eyebrow),intro=VALUES(intro),content_json=VALUES(content_json),seo_title=VALUES(seo_title),seo_description=VALUES(seo_description),status='published',published_at=COALESCE(published_at,NOW())`,
  [
    "faq",
    "Frequently asked questions",
    "Help centre",
    "Helpful answers about choosing formulas, caring for your skin and shopping with Natural Beauty.",
    JSON.stringify(content),
    "FAQ | Natural Beauty",
    "Answers about Natural Beauty skincare, orders, delivery, returns and refunds.",
  ],
);
console.log(`Seeded ${content.length} FAQ entries.`);
await pool.end();
