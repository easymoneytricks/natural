import { apiRequest } from "../lib/api";

export const createCashfreeOrder = (body, authFetch) =>
  authFetch
    ? authFetch("/payments/cashfree/create", { method: "POST", body })
    : apiRequest("/payments/cashfree/create", { method: "POST", body });

export const createRazorpayOrder = (body, authFetch) =>
  authFetch
    ? authFetch("/payments/razorpay/create", { method: "POST", body })
    : apiRequest("/payments/razorpay/create", { method: "POST", body });

export const verifyRazorpay = (body, authFetch) =>
  authFetch
    ? authFetch("/payments/razorpay/verify", { method: "POST", body })
    : apiRequest("/payments/razorpay/verify", { method: "POST", body });
