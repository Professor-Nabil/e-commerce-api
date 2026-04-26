import { Router } from "express";
import {
  changeUserRole,
  getUsers,
  toggleUserBan,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Only Admins allowed
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);
router.patch("/:id/status", authenticate, authorize(["ADMIN"]), toggleUserBan);
router.patch("/:id/role", authenticate, authorize(["ADMIN"]), changeUserRole);

export default router;
