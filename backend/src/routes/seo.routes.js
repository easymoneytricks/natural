import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();
const site = () =>
  (process.env.STOREFRONT_URL || "http://localhost:5173").replace(/\/$/, "");
const xml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

router.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const [products] = await pool.execute(
      "SELECT slug,updated_at FROM products WHERE status='active' AND is_active=1 AND deleted_at IS NULL",
    );
    const [categories] = await pool.execute(
      "SELECT slug,updated_at FROM categories WHERE is_active=1 AND deleted_at IS NULL",
    );
    const [pages] = await pool.execute(
      "SELECT slug,updated_at FROM content_pages WHERE status='published'",
    );
    const urls = [
      "/",
      "/shop",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      ...products.map((row) => `/product/${row.slug}`),
      ...categories.map((row) => `/shop?category=${row.slug}`),
      ...pages.map((row) => `/pages/${row.slug}`),
    ];
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>${xml(`${site()}${path}`)}</loc></url>`).join("")}</urlset>`,
      );
  } catch (error) {
    next(error);
  }
});

router.get("/robots.txt", (_req, res) => {
  res
    .type("text/plain")
    .send(
      `User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /checkout\nDisallow: /cart\nDisallow: /wishlist\nDisallow: /compare\nDisallow: /admin\nSitemap: ${site()}/sitemap.xml\n`,
    );
});

export default router;
