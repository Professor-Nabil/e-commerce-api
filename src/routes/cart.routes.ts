import { Router } from "express";
import {
  addToCart,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  AddToCartSchema,
  UpdateCartItemSchema,
} from "../schemas/cart.schema.js";

const router = Router();

router.get("/", authenticate, getCart);
router.post("/", authenticate, validate(AddToCartSchema), addToCart);
router.delete("/", authenticate, clearCart); // Clear full cart

// Specific item operations
router.patch(
  "/:productId",
  authenticate,
  validate(UpdateCartItemSchema),
  updateQuantity,
);
router.delete("/:productId", authenticate, removeItem);

export default router;
