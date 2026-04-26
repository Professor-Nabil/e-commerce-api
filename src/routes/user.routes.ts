import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Only Admins allowed
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);

export default router;
