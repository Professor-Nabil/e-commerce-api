You're right to want full automation. Relying on the seed in a test can be risky because if the seed fails or changes, your tests break. Creating a product "on the fly" inside the test is the true TDD way.

Here is the plan to finish the **Shopping Cart** feature.

### 1. The Validation Schema

We need to ensure the `productId` is a valid string and `quantity` is at least 1.

**File:** `src/schemas/cart.schema.ts`

```typescript
import { z } from "zod";

export const AddToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  }),
});
```

---

### 2. The Cart Controller

This is where we connect the service to the request. We pull the `userId` directly from the `authenticate` middleware.

**File:** `src/controllers/cart.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import * as CartService from "../services/cart.service.js";

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user!.id; // req.user is set by authenticate middleware

    const cartItem = await CartService.addToCart(userId, productId, quantity);
    res.status(200).json(cartItem);
  } catch (error) {
    next(error);
  }
};
```

---

### 3. The Cart Routes

**File:** `src/routes/cart.routes.ts`

```typescript
import { Router } from "express";
import { addToCart } from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { AddToCartSchema } from "../schemas/cart.schema.js";

const router = Router();

// Users must be logged in to manage their cart
router.post("/", authenticate, validate(AddToCartSchema), addToCart);

export default router;
```

_Don't forget to register this in `src/app.ts`: `app.use("/api/cart", cartRoutes);`_

---

### 4. The Fully Automated Test

This test now creates its own Admin, its own Product, and its own Customer. It is 100% independent.

**Update `tests/cart.test.ts`**:

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Shopping Cart Flow", () => {
  it("should create a product as admin and add it to cart as customer", async () => {
    // 1. Setup Admin and Product
    const admin = {
      email: "admin_cart@test.com",
      password: "password123",
      role: "ADMIN",
    };
    await request(app).post("/api/auth/register").send(admin);
    const adminLogin = await request(app).post("/api/auth/login").send(admin);

    const prodRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminLogin.body.token}`)
      .send({
        name: "Test Laptop",
        description: "A high-end gaming laptop for testing",
        price: 1200,
        stock: 5,
      });
    const productId = prodRes.body.id;

    // 2. Setup Customer
    const customer = {
      email: "customer_cart@test.com",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(customer);
    const customerLogin = await request(app)
      .post("/api/auth/login")
      .send(customer);
    const customerToken = customerLogin.body.token;

    // 3. Add to cart first time (Quantity 1)
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 1 });

    // 4. Add to cart second time (Quantity 2)
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 2 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.productId).toBe(productId);
    expect(res.body.quantity).toBe(3); // 1 + 2 = 3
  });
});
```

### 🧐 Why the logic changed to `3`?

In my service code, I used `increment: quantity`. If you add `1` item and then add `2` more, the resulting quantity in the database should be `3`. This proves the **Upsert** logic is working correctly!

**Run the tests.** If they pass, we’ve successfully implemented our first complex relationship!

**What's next?** 1. `GET /api/cart` to see the full cart with product details (using Prisma `include`). 2. `DELETE /api/cart/:id` to remove an item. 3. **Checkout** (The big boss of logic).
