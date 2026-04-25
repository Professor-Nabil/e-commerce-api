import { Router } from "express";
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js"; // Import validate
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "../schemas/product.schema.js"; // Import Schema
import { upload } from "../config/multer.js";

const router = Router();

// Public: Anyone can see products
router.get("/", getProducts);

// GET /api/products/123
router.get("/:id", getProductById);

// Private: Only Admins can add products
// router.post("/", authenticate, authorize(["ADMIN"]), createProduct);
// router.post(
//   "/",
//   authenticate,
//   authorize(["ADMIN"]),
//   validate(CreateProductSchema),
//   createProduct,
// );
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  upload.array("images", 5), // 'images' is the field name, max 5 files
  validate(CreateProductSchema), // Note: You might need to adjust validation!
  createProduct,
);

// Update a product
router.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate(UpdateProductSchema),
  updateProduct,
);

// Soft Delete a product
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteProduct);

export default router;
