import { Router } from "express";
import { getUsers, toggleUserBan } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Only Admins allowed
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);
router.patch("/:id/status", authenticate, authorize(["ADMIN"]), toggleUserBan);

export default router;
