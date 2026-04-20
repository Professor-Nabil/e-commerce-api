import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { RegisterSchema } from "../schemas/auth.schema.js";

const router = Router();

// Now the request must pass 'validate' before it ever reaches 'register'
router.post("/register", validate(RegisterSchema), register);

export default router;
