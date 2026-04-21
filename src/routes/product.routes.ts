import { Router } from "express";
import {
  getProducts,
  createProduct,
  getProductById,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js"; // Import validate
import { CreateProductSchema } from "../schemas/product.schema.js"; // Import Schema

const router = Router();

// Public: Anyone can see products
router.get("/", getProducts);

// GET /api/products/123
router.get("/:id", getProductById);

// Private: Only Admins can add products
// router.post("/", authenticate, authorize(["ADMIN"]), createProduct);
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  validate(CreateProductSchema),
  createProduct,
);

// Pipeline: Auth -> Role Check -> Data Validation -> Controller
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  validate(CreateProductSchema),
  createProduct,
);

export default router;
