# 🛡️ Next Step: Data Validation (The Zod Guard)

Right now, your API is "trusting." If a user sends a registration request with an empty email or a 2-character password, the server will try to process it. We need a **Validator** to sit between the Route and the Controller.

We'll use **Zod**. It’s the industry standard for TypeScript because it gives you type-safety and validation in one go.

#### 1. Install Zod

```bash
npm install zod
```

#### 2. The TDD "Red" Phase

Let's write a test that expects a failure when the data is garbage.

**Update `tests/auth.test.ts`**:

```typescript
it("should return 400 if email is invalid", async () => {
  const res = await request(app).post("/api/auth/register").send({
    email: "not-an-email",
    password: "123",
  });

  expect(res.statusCode).toEqual(400);
  expect(res.body.error.message).toContain("Invalid email");
});
```

#### 3. Create the Schema

Create a new folder `src/schemas/` to keep your validation rules organized.

**File:** `src/schemas/auth.schema.ts`

```typescript
import { z } from "zod";

export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});
```

#### 4. The Validation Middleware

Instead of writing validation inside the controller, we'll create a reusable middleware.

**File:** `src/middlewares/validate.middleware.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      // Pass Zod errors to our global error handler
      return res
        .status(400)
        .json({ error: { message: error.errors[0].message } });
    }
  };
```

#### 5. Apply to Routes

**File:** `src/routes/auth.routes.ts`

```typescript
import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { RegisterSchema } from "../schemas/auth.schema.js";

const router = Router();

// Now the request must pass 'validate' before it ever reaches 'register'
router.post("/register", validate(RegisterSchema), register);

export default router;
```

**Does that test turn Green?** Once it does, you've officially moved from "It works" to "It's secure."

What do you think—ready to add the **Login** functionality next, or do you want to add more validation rules (like `role` or `name`)?
