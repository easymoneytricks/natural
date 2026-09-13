import { pool } from "../src/config/database.js";

const content = [
  [
    "Where it began",
    "Natural Beauty began with a simple belief: a good routine should feel easy to understand, lovely to use and genuinely useful to your skin. We make botanical skincare for the everyday moments that become rituals.",
  ],
  [
    "A considered approach",
    "We create uncomplicated formulas for real routines: the cleanser you reach for every morning, the serum you use when your skin needs support, and the moisturiser that brings everything together. Each product is designed to work beautifully on its own and even better as a thoughtful, flexible ritual.",
  ],
  [
    "Botanical inspiration",
    "We look to plants for comfort, resilience and texture, then pair that inspiration with ingredients selected for a clear, useful role. Our formulas are made to feel familiar, considered and easy to return to.",
  ],
  [
    "Modern formulation",
    "Every formula is developed around everyday skin needs, with considered concentrations, pleasant textures and straightforward directions. We keep the routine focused so you can make space for what your skin actually needs today.",
  ],
  [
    "Honest care",
    "We keep our language clear, our routines practical and our promises grounded in what a product is designed to do. Skin is personal and results vary, so we encourage patch testing and professional advice when a concern persists.",
  ],
];

await pool.execute(
  `INSERT INTO content_pages (slug,title,eyebrow,intro,content_json,seo_title,seo_description,status,published_at)
   VALUES (?,?,?,?,?,?,?,'published',NOW())
   ON DUPLICATE KEY UPDATE title=VALUES(title),eyebrow=VALUES(eyebrow),intro=VALUES(intro),content_json=VALUES(content_json),seo_title=VALUES(seo_title),seo_description=VALUES(seo_description),status='published',published_at=COALESCE(published_at,NOW())`,
  [
    "about",
    "Skincare with less noise, and more intention.",
    "Our story",
    "Natural Beauty makes botanical skincare with modern formulation and a clear point of view: thoughtful care should feel simple, personal and easy to stay with.",
    JSON.stringify(content),
    "About Natural Beauty | Our story",
    "Discover the Natural Beauty approach to botanical skincare, modern formulation and honest everyday care.",
  ],
);
console.log(`Seeded ${content.length} About page sections.`);
await pool.end();
