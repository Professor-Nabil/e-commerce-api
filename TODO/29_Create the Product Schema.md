Everything is perfectly staged. Your routes and controllers are clean, which makes adding validation straightforward. Since we already have the `validate` middleware from the Auth step, we just need to plug in the new schema.

### 1. Create the Product Schema

First, let's create the definition of what a "valid" product looks like.

**File:** `src/schemas/product.schema.ts`

```typescript
import { z } from "zod";

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    // Using coerce.number() helps if numbers come in as strings from some clients
    price: z.coerce.number().positive("Price must be a positive number"),
    stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  }),
});
```

---

### 2. Update Product Routes

Now, we inject the validation middleware. It should sit **after** authentication but **before** the controller. This way, we don't even bother validating data from unauthenticated users.

**File:** `src/routes/product.routes.ts`

```typescript
import { Router } from "express";
import {
  getProducts,
  createProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js"; // Import validate
import { CreateProductSchema } from "../schemas/product.schema.js"; // Import Schema

const router = Router();

router.get("/", getProducts);

// Pipeline: Auth -> Role Check -> Data Validation -> Controller
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  validate(CreateProductSchema),
  createProduct,
);

export default router;
```

---

### 3. The TDD Verification

Now, let's add the "Sad Path" test cases to ensure our validation is actually stopping bad data.

**Update `tests/product.test.ts`**:

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Product Validation", () => {
  it("should return 400 if product description is too short", async () => {
    // 1. Get Admin Token (assuming admin@test.com is registered in your setup or previous test)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password123" });

    const token = loginRes.body.token;

    // 2. Try to create product with short description
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Pro Mouse",
        description: "Too short",
        price: 50,
        stock: 100,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toContain(
      "Description must be at least 10 characters",
    );
  });
});
```

---

### 🧪 Run the Tests

```bash
npm test tests/product.test.ts
```

### 🧐 Why this is better

Before this change, if you forgot the `description`, Prisma would throw a database error, resulting in a `500 Internal Server Error`. Now, Zod catches it at the "gate," giving the user a helpful `400 Bad Request` with a specific message.

**Does the test pass?** Once it does, we can finally move to the most exciting part: **The Shopping Cart and Database Relationships.**
