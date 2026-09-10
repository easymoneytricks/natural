import { Router } from "express";
import { requireCustomerAuth } from "../middleware/customerAuth.js";
import {
  addresses,
  create,
  makeDefault,
  patch,
  patchProfile,
  profile,
  remove,
} from "../controllers/customer.controller.js";

const router = Router();
router.use(requireCustomerAuth);
router.get("/profile", profile);
router.patch("/profile", patchProfile);
router.get("/addresses", addresses);
router.post("/addresses", create);
router.patch("/addresses/:id", patch);
router.delete("/addresses/:id", remove);
router.post("/addresses/:id/default", makeDefault);
export default router;
