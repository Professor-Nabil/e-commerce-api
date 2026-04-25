import { Router } from "express";
import {
  checkout,
  getOrderHistory,
  getAllOrders,
  updateStatus,
} from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Customer Routes
router.get("/", authenticate, getOrderHistory);
router.post("/checkout", authenticate, checkout);

// Admin Routes
// We changed "/" to "/admin" to avoid clashing with the customer's history route
router.get("/admin", authenticate, authorize(["ADMIN"]), getAllOrders);
router.patch("/:id/status", authenticate, authorize(["ADMIN"]), updateStatus);

export default router;
