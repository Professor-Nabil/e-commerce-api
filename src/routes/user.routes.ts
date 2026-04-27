import { Router } from "express";
import {
  changeUserRole,
  getUsers,
  toggleUserBan,
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { UpdateProfileSchema } from "../schemas/user.schema.js";

const router = Router();

// --- Customer Self-Service Routes ---
router.get("/me/profile", authenticate, getMyProfile);
router.patch(
  "/me/profile",
  authenticate,
  validate(UpdateProfileSchema),
  updateMyProfile,
);

// --- Admin Management Routes ---
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);
router.patch("/:id/status", authenticate, authorize(["ADMIN"]), toggleUserBan);
router.patch(
  "/:id/role",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  changeUserRole,
);

export default router;
