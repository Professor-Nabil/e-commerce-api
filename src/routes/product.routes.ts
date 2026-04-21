import { Router } from "express";
import {
  getProducts,
  createProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Public: Anyone can see products
router.get("/", getProducts);

// Private: Only Admins can add products
router.post("/", authenticate, authorize(["ADMIN"]), createProduct);

export default router;
