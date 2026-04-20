# Step 1: Environment Variables

Run these commands in your terminal to add a secret key to both environment files.

```bash
echo 'JWT_SECRET="arch_linux_is_the_best_2026"' >> .env
echo 'JWT_SECRET="test_secret_key"' >> .env.test
```

---

### Step 2: The Login Controller

We'll update your controller to handle the login flow and return that token.

**File:** `src/controllers/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service.js";

// ... keep your register function ...

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AuthService.loginUser(req.body);
    // result contains { token, user }
    res.status(200).json(result);
  } catch (error: any) {
    // If AuthService throws "Invalid credentials", this catches it
    if (error.message === "Invalid credentials") {
      return res
        .status(401)
        .json({ error: { message: "Invalid email or password" } });
    }
    next(error);
  }
};
```

---

### Step 3: The Route

Now we wire the endpoint and attach the validation we created in the last step.

**File:** `src/routes/auth.routes.ts`

```typescript
import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js"; // Import login
import { validate } from "../middlewares/validate.middleware.js";
import { RegisterSchema, LoginSchema } from "../schemas/auth.schema.js"; // Import LoginSchema

const router = Router();

router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login); // New Login Route

export default router;
```

---

### 🧪 Verification

Now that the code is in place, run your tests:

```bash
npm test
```

**If you see green:** Your API now officially supports the full "Identity" cycle (Register -> Hash -> Validate -> Login -> Issue Token).

**If you see red:** Let me know the error. It might be a missing import or a naming mismatch.

### 🔍 One thing to check

Since you're using **ES Modules** (`"type": "module"` in `package.json`), make sure all your imports inside `auth.controller.ts` and `auth.routes.ts` have the **`.js`** extension (e.g., `../services/auth.service.js`).

**Once this passes, do you want to see how to use this Token to protect a route (like making `POST /api/products` only for Admins)?**
