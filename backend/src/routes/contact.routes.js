import { Router } from "express";
import { create } from "../controllers/contact.controller.js";

const router = Router();
router.post("/contact-submissions", create);
export default router;
