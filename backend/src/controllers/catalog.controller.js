import { pool } from "../config/database.js";
import * as catalog from "../services/catalog.service.js";

const handle = (operation) => async (req, res, next) => {
  try {
    res.json(await operation(req));
  } catch (error) {
    next(error);
  }
};

export const listProducts = handle((req) =>
  catalog.listProducts(pool, req.query),
);
export const getProduct = async (req, res, next) => {
  try {
    try {
      res.json({ data: await catalog.getProduct(pool, req.params.slug) });
    } catch (error) {
      if (error.code !== "PRODUCT_NOT_FOUND") throw error;
      const [[redirect]] = await pool.execute(
        "SELECT p.slug FROM product_slug_redirects r JOIN products p ON p.id=r.product_id WHERE r.old_slug=? AND p.deleted_at IS NULL AND p.is_active=1 LIMIT 1",
        [req.params.slug],
      );
      if (!redirect) throw error;
      res.redirect(
        301,
        `/api/v1/products/${encodeURIComponent(redirect.slug)}`,
      );
    }
  } catch (error) {
    next(error);
  }
};
export const listCategories = handle(() => catalog.listCategories(pool));
export const getCategory = handle((req) =>
  catalog.getCategory(pool, req.params.slug),
);
export const listBrands = handle(() => catalog.listBrands(pool));
export const getBrand = handle((req) =>
  catalog.getBrand(pool, req.params.slug),
);
export const getFilters = handle(() => catalog.getFilters(pool));
