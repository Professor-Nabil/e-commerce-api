import { Router } from "express";
import {
  getCategories,
  addCategory,
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", getCategories); // Public: anyone can see categories
router.post("/", authenticate, authorize(["ADMIN"]), addCategory); // Admin only

export default router;
