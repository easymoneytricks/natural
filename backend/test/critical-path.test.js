import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });
import test from "node:test";
import assert from "node:assert/strict";
const { pool } = await import("../src/config/database.js");

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:4000";
let available = false;
try {
  const response = await fetch(`${baseUrl}/api/health`);
  available = response.ok;
} catch {}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  let body = null;
  try {
    body = await response.json();
  } catch {}
  return { response, body };
}

test(
  "health and public catalog are available",
  { skip: !available },
  async () => {
    const health = await request("/api/health");
    assert.equal(health.response.status, 200);
    const catalog = await request("/api/v1/products");
    assert.equal(catalog.response.status, 200);
    assert.ok(Array.isArray(catalog.body.data));
  },
);

test(
  "invalid login and protected routes fail closed",
  { skip: !available },
  async () => {
    const login = await request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid@example.invalid",
        password: "wrong",
      }),
    });
    assert.equal(login.response.status, 401);
    const orders = await request("/api/v1/customer/orders");
    assert.equal(orders.response.status, 401);
    const admin = await request("/api/v1/admin/orders");
    assert.equal(admin.response.status, 401);
  },
);

test(
  "quote and payment callbacks reject invalid requests",
  { skip: !available },
  async () => {
    const quote = await request("/api/v1/checkout/quote", {
      method: "POST",
      body: JSON.stringify({ items: [] }),
    });
    assert.equal(quote.response.status, 200);
    assert.equal(quote.body.data.checkoutReady, false);
    const webhook = await request("/api/v1/webhooks/cashfree", {
      method: "POST",
      body: JSON.stringify({}),
    });
    assert.equal(webhook.response.status, 400);
  },
);

const e2eEmail = process.env.E2E_EMAIL;
const e2ePassword = process.env.E2E_PASSWORD;
test(
  "authenticated cart and quote smoke path",
  {
    skip: !available || !e2eEmail || !e2ePassword,
  },
  async () => {
    const login = await request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: e2eEmail, password: e2ePassword }),
    });
    assert.equal(login.response.status, 200);
    const token = login.body.data.accessToken;
    const cart = await request("/api/v1/customer/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(cart.response.status, 200);
    const quote = await request("/api/v1/checkout/quote", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ shippingMethod: "STANDARD" }),
    });
    assert.ok([200, 409].includes(quote.response.status));
  },
);

test(
  "customer signup requires email verification before login",
  { skip: !available || process.env.RUN_OTP_INTEGRATION !== "true" },
  async () => {
    const email = `otp-${Date.now()}@example.test`;
    try {
      const registration = await request("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: "OTP",
          lastName: "Test",
          email,
          phone: "9876543210",
          password: "StrongPassword!123",
        }),
      });
      assert.equal(registration.response.status, 202);
      assert.equal(registration.body.data.verificationRequired, true);

      const login = await request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: "StrongPassword!123" }),
      });
      assert.equal(login.response.status, 403);
      assert.equal(login.body.error.code, "EMAIL_NOT_VERIFIED");
    } finally {
      await pool
        .execute("DELETE FROM customers WHERE email=?", [email])
        .catch(() => {});
    }
  },
);
