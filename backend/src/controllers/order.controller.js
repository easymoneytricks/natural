import { pool } from "../config/database.js";
import {
  listOrders,
  getOrder,
  placeCodOrder,
} from "../services/order.service.js";
import { orderEmail, sendEmail } from "../services/mail.service.js";
export async function createOrder(req, res, next) {
  try {
    const order = await placeCodOrder(pool, req.body, req.customer);
    const customerEmail = req.body?.contact?.email || order.customerEmail;
    const customerName = req.body?.shippingAddress?.firstName;
    Promise.allSettled([
      customerEmail
        ? sendEmail(
            orderEmail({ order, recipient: customerEmail, name: customerName }),
          )
        : Promise.resolve(),
      process.env.ADMIN_NOTIFICATION_EMAIL
        ? sendEmail({
            ...orderEmail({
              order,
              recipient: process.env.ADMIN_NOTIFICATION_EMAIL,
              name: "team",
              admin: true,
            }),
            eventType: "order.received",
            subject: `New order received · ${order.orderNumber}`,
          })
        : Promise.resolve(),
    ]).catch(() => {});
    res.status(201).json({ data: { order } });
  } catch (e) {
    next(e);
  }
}
export async function customerOrders(req, res, next) {
  try {
    res.json({ data: await listOrders(pool, req.customer.id) });
  } catch (e) {
    next(e);
  }
}
export async function customerOrder(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT id FROM orders WHERE order_number=? AND customer_id=?",
      [req.params.orderNumber, req.customer.id],
    );
    if (!rows[0]) {
      const e = new Error("Order not found.");
      e.statusCode = 404;
      e.code = "ORDER_NOT_FOUND";
      throw e;
    }
    res.json({
      data: { order: await getOrder(pool, rows[0].id, req.customer.id) },
    });
  } catch (e) {
    next(e);
  }
}
