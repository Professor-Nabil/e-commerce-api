The red text in the terminal is the most satisfying part of the process—it means your test is actually working! It’s checking for a reality that doesn't exist yet.

To turn this **Green**, we need to build the "Auth" vertical. We’ll follow the same pattern we used for Products: **Route -> Controller -> Service**.

### 1. The Auth Service (The Brain)

We need `bcrypt` to hash the password. Since you're building a secure API, we never store passwords as plain text in MariaDB.

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

**File:** `src/services/auth.service.ts`

```typescript
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";

export const registerUser = async (userData: any) => {
  // 1. Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // 2. Save to MariaDB
  return await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
    },
    select: {
      // Don't return the password to the user!
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};
```

---

### 2. The Auth Controller (The Delivery)

This will call the service and handle the HTTP response codes that your test is looking for.

**File:** `src/controllers/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newUser = await AuthService.registerUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error); // This goes to our global error handler!
  }
};
```

---

### 3. The Auth Routes (The Entrance)

Now, we wire it up to the `/api/auth` path.

**File:** `src/routes/auth.routes.ts`

```typescript
import { Router } from "express";
import { register } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

export default router;
```

---

### 4. Update `src/app.ts`

Register the new auth routes in your main file.

```typescript
// ... imports ...
import authRoutes from "./routes/auth.routes.js";

// ... existing code ...
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes); // Add this!
// ... error handler ...
```

---

### 🧪 The Moment of Truth

Now, run your test again:

```bash
npm test
```

### ⚠️ A Note on the "Database" Problem in Tests

When you run this test, it will actually try to write to your `ecommerce_db` MariaDB.

- **The Problem:** If you run the test twice, it will fail because the email `test@example.com` already exists!
- **The Pro Solution:** In professional TDD, we usually use a separate **Test Database** or a "Cleanup" script that deletes test users before every run.

**Did the test turn Green on the first try?** If you get a `400` or `500` error, check your Neovim logs—Prisma might be complaining about a duplicate email if you've already manually tested that user!
