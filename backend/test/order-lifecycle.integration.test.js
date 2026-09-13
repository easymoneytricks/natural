import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });
import test from "node:test";
import assert from "node:assert/strict";
const { pool } = await import("../src/config/database.js");
const { addCartItem, clearCart } =
  await import("../src/services/customerCart.service.js");
const { placeCodOrder } = await import("../src/services/order.service.js");
const { updateStatus } = await import("../src/services/adminOrder.service.js");

const enabled = process.env.RUN_MUTATING_INTEGRATION === "true";
const email = process.env.E2E_EMAIL;
const adminEmail = process.env.E2E_ADMIN_EMAIL;

test(
  "COD order, admin cancellation, and stock release are transactional",
  { skip: !enabled || !email || !adminEmail },
  async () => {
    let order;
    let customer;
    let sku;
    let cartId;
    const connection = await pool.getConnection();
    try {
      const [[customerRow]] = await connection.execute(
        'SELECT id,email,first_name,last_name,phone FROM customers WHERE email=? AND status="active" AND deleted_at IS NULL',
        [email.toLowerCase()],
      );
      const [[admin]] = await connection.execute(
        'SELECT id FROM admin_users WHERE email=? AND status="active" AND deleted_at IS NULL',
        [adminEmail.toLowerCase()],
      );
      const [[skuRow]] = await connection.execute(
        `SELECT ps.id, i.quantity_on_hand, i.reserved_quantity
         FROM product_skus ps
         JOIN products p ON p.id=ps.product_id
         JOIN inventory i ON i.sku_id=ps.id
         WHERE ps.is_active=1 AND ps.deleted_at IS NULL AND p.is_active=1 AND p.deleted_at IS NULL
           AND ps.track_inventory=1 AND ps.allow_backorder=0
           AND i.quantity_on_hand-i.reserved_quantity>0
         ORDER BY ps.id LIMIT 1`,
      );
      assert.ok(customerRow, "E2E_EMAIL must be an active customer");
      assert.ok(admin, "E2E_ADMIN_EMAIL must be an active admin");
      assert.ok(skuRow, "A purchasable tracked SKU is required");
      customer = customerRow;
      sku = skuRow;
      const [[cart]] = await connection.execute(
        "SELECT id FROM customer_carts WHERE customer_id=?",
        [customer.id],
      );
      cartId = cart?.id;
      await clearCart(pool, customer.id);
      await addCartItem(pool, customer.id, sku.id, 1);
      const [[before]] = await connection.execute(
        "SELECT reserved_quantity FROM inventory WHERE sku_id=?",
        [sku.id],
      );
      order = await placeCodOrder(
        pool,
        {
          paymentMethod: "cod",
          idempotencyKey: `integration-${Date.now()}-${Math.random()}`,
          shippingMethod: "STANDARD",
          contact: { email: customer.email, phone: customer.phone },
          shippingAddress: {
            firstName: customer.first_name || "Test",
            lastName: customer.last_name || "Customer",
            phone: String(customer.phone || "9876543210")
              .replace(/\D/g, "")
              .slice(-10),
            addressLine1: "Integration test address",
            city: "Bengaluru",
            state: "Karnataka",
            postalCode: "560038",
            countryCode: "IN",
          },
        },
        customer,
      );
      assert.equal(order.status, "confirmed");
      assert.equal(order.paymentMethod, "cod");
      const [[reserved]] = await connection.execute(
        "SELECT reserved_quantity FROM inventory WHERE sku_id=?",
        [sku.id],
      );
      assert.equal(
        Number(reserved.reserved_quantity),
        Number(before.reserved_quantity) + 1,
      );

      const cancelled = await updateStatus(
        pool,
        order.orderNumber,
        "cancelled",
        "Automated lifecycle test",
        admin.id,
        { get: () => "critical-path-test", ip: "127.0.0.1" },
      );
      assert.equal(cancelled.status, "cancelled");
      const [[released]] = await connection.execute(
        "SELECT reserved_quantity FROM inventory WHERE sku_id=?",
        [sku.id],
      );
      assert.equal(
        Number(released.reserved_quantity),
        Number(before.reserved_quantity),
      );
    } finally {
      if (customer) {
        await clearCart(pool, customer.id).catch(() => {});
        if (cartId) {
          await connection
            .execute("DELETE FROM customer_cart_items WHERE cart_id=?", [
              cartId,
            ])
            .catch(() => {});
        }
      }
      if (order?.orderNumber) {
        await connection
          .execute("DELETE FROM orders WHERE order_number=?", [
            order.orderNumber,
          ])
          .catch(() => {});
      }
      connection.release();
    }
  },
);
