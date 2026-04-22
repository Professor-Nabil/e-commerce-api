import { Router } from "express";
import { addToCart, getCart } from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { AddToCartSchema } from "../schemas/cart.schema.js";

const router = Router();

// Users must be logged in to manage their cart
router.post("/", authenticate, validate(AddToCartSchema), addToCart);

router.get("/", authenticate, getCart);

export default router;
