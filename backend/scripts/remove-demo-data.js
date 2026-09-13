import "dotenv/config";
import { pool } from "../src/config/database.js";

const markedCustomer = "aanya@example.com";

async function removeDemoData() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [products] = await connection.query(
      "SELECT id FROM products WHERE slug LIKE 'qa-%' OR name LIKE 'QA %'",
    );
    const [categories] = await connection.query(
      "SELECT id FROM categories WHERE slug LIKE 'qa-%' OR name LIKE 'QA %'",
    );

    if (products.length) {
      await connection.query(
        `DELETE FROM products WHERE id IN (${products.map(() => "?").join(",")})`,
        products.map((row) => row.id),
      );
    }
    if (categories.length) {
      await connection.query(
        `DELETE FROM categories WHERE id IN (${categories.map(() => "?").join(",")})`,
        categories.map((row) => row.id),
      );
    }

    const [customers] = await connection.query(
      "SELECT id FROM customers WHERE email = ?",
      [markedCustomer],
    );
    if (customers.length) {
      await connection.query("DELETE FROM customers WHERE id = ?", [
        customers[0].id,
      ]);
    }

    await connection.commit();
    console.log("Removed marked demo records", {
      products: products.length,
      categories: categories.length,
      customers: customers.length,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

removeDemoData().catch((error) => {
  console.error(`Demo cleanup failed: ${error.message}`);
  process.exitCode = 1;
});
