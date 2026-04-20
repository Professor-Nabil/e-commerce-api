import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js"; // Import login
import { validate } from "../middlewares/validate.middleware.js";
import { RegisterSchema, LoginSchema } from "../schemas/auth.schema.js"; // Import LoginSchema

const router = Router();

// Now the request must pass 'validate' before it ever reaches 'register'
router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login); // New Login Route

export default router;
