export const getCart = (authFetch) => authFetch("/customer/cart");
export const addCartItem = (authFetch, skuId, quantity) =>
  authFetch("/customer/cart/items", {
    method: "POST",
    body: { skuId, quantity },
  });
export const updateCartItem = (authFetch, skuId, quantity) =>
  authFetch(`/customer/cart/items/${skuId}`, {
    method: "PATCH",
    body: { quantity },
  });
export const removeCartItem = (authFetch, skuId) =>
  authFetch(`/customer/cart/items/${skuId}`, { method: "DELETE" });
export const clearCart = (authFetch) =>
  authFetch("/customer/cart", { method: "DELETE" });
export const mergeCart = (authFetch, items, mergeId) =>
  authFetch("/customer/cart/merge", {
    method: "POST",
    body: { items, mergeId },
  });
export const getWishlist = (authFetch) => authFetch("/customer/wishlist");
export const addWishlist = (authFetch, productId) =>
  authFetch("/customer/wishlist/items", {
    method: "POST",
    body: { productId },
  });
export const removeWishlist = (authFetch, productId) =>
  authFetch(`/customer/wishlist/items/${productId}`, { method: "DELETE" });
export const mergeWishlist = (authFetch, productIds) =>
  authFetch("/customer/wishlist/merge", {
    method: "POST",
    body: { productIds },
  });
