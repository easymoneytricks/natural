import { Router } from "express";
import { requireCustomerAuth } from "../middleware/customerAuth.js";
import {
  addCartItem,
  addWishlist,
  clearCart,
  getCart,
  getWishlist,
  mergeCart,
  mergeWishlist,
  removeCartItem,
  removeWishlist,
  updateCartItem,
} from "../controllers/customerCommerce.controller.js";
const router = Router();
router.use(requireCustomerAuth);
router.get("/cart", getCart);
router.post("/cart/items", addCartItem);
router.patch("/cart/items/:skuId", updateCartItem);
router.delete("/cart/items/:skuId", removeCartItem);
router.delete("/cart", clearCart);
router.post("/cart/merge", mergeCart);
router.get("/wishlist", getWishlist);
router.post("/wishlist/items", addWishlist);
router.delete("/wishlist/items/:productId", removeWishlist);
router.post("/wishlist/merge", mergeWishlist);
export default router;
