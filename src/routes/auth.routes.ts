import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js"; // Import login
import { validate } from "../middlewares/validate.middleware.js";
import {
  RegisterSchema,
  LoginSchema,
  ResetPasswordSchema,
  ForgotPasswordSchema,
} from "../schemas/auth.schema.js"; // Import LoginSchema

const router = Router();

// Now the request must pass 'validate' before it ever reaches 'register'
router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login); // New Login Route
router.post("/forgot-password", validate(ForgotPasswordSchema), forgotPassword);
router.post(
  "/reset-password/:token",
  validate(ResetPasswordSchema),
  resetPassword,
);

export default router;
