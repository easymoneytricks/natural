import { apiRequest } from "../lib/api";
export const createOrder = (body, authFetch) =>
  authFetch
    ? authFetch("/orders", { method: "POST", body })
    : apiRequest("/orders", { method: "POST", body });
