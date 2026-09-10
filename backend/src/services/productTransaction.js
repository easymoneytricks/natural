import { AuthError } from "./auth.service.js";

export async function productTransaction(pool, productId, work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (productId) {
      const [[product]] = await connection.execute(
        "SELECT id,deleted_at FROM products WHERE id=? FOR UPDATE",
        [productId],
      );
      if (!product || product.deleted_at) {
        throw new AuthError(404, "PRODUCT_NOT_FOUND", "Active product record not found. Restore it before editing.");
      }
    }
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
