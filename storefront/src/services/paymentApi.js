import { apiRequest } from "../lib/api";

export const createCashfreeOrder = (body, authFetch) =>
  authFetch
    ? authFetch("/payments/cashfree/create", { method: "POST", body })
    : apiRequest("/payments/cashfree/create", { method: "POST", body });
