import { Router } from "express";
import { checkout, getOrderHistory } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getOrderHistory);
router.post("/checkout", authenticate, checkout);

export default router;
