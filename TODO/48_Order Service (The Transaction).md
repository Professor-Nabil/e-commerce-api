### 1. The Order Service (The Transaction)

We’ll use `prisma.$transaction`. If any part fails (like if a product is out of stock), everything rolls back automatically.

**File:** `src/services/order.service.ts`

```typescript
import { prisma } from "../config/prisma.js";

export const checkout = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the cart and items
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // 2. Validate stock and calculate total
    let total = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name}`);
      }
      total += Number(item.product.price) * item.quantity;
    }

    // 3. Create the Order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: total,
        status: "COMPLETED", // For MVP, we'll assume payment is instant
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // 4. Update Stock
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 5. Clear the Cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
};
```

---

### 2. The Order Controller

**File:** `src/controllers/order.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import * as OrderService from "../services/order.service.js";

export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const order = await OrderService.checkout(userId);
    res.status(201).json(order);
  } catch (error: any) {
    // If it's a validation error (stock/empty cart), send 400
    if (error.message === "Cart is empty" || error.message.includes("stock")) {
      return res.status(400).json({ error: { message: error.message } });
    }
    next(error);
  }
};
```

---

### 3. The Order Routes

**File:** `src/routes/order.routes.ts`

```typescript
import { Router } from "express";
import { checkout } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/checkout", authenticate, checkout);

export default router;
```

_Add `app.use("/api/orders", orderRoutes);` to your `src/app.ts`._

---

### 🧪 4. The Automated Test

This test checks the whole cycle: Create Product -> Add to Cart -> Checkout -> Check Stock.

**File:** `tests/checkout.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Checkout System", () => {
  it("should complete checkout, create an order, and decrement stock", async () => {
    // 1. Setup Admin & Product (Stock: 10)
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin_cart@test.com", password: "password123" });
    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminLogin.body.token}`)
      .send({
        name: "GPU",
        description: "RTX 5090 Super",
        price: 2000,
        stock: 10,
      });
    const productId = prod.body.id;

    // 2. Setup Customer & Add 2 to Cart
    const customer = { email: "buyer@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(customer);
    const login = await request(app).post("/api/auth/login").send(customer);
    const token = login.body.token;

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId, quantity: 2 });

    // 3. Checkout
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(201);
    expect(Number(res.body.totalAmount)).toBe(4000);

    // 4. Verify Stock is now 8
    const updatedProd = await prisma.product.findUnique({
      where: { id: productId },
    });
    expect(updatedProd?.stock).toBe(8);

    // 5. Verify Cart is empty
    const cartRes = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);
    expect(cartRes.body.items.length).toBe(0);
  });
});
```

### 🛠️ Execution

1. Create the **Service**, **Controller**, and **Route**.
2. Register the route in `app.ts`.
3. Run the test: `npm test tests/checkout.test.ts`.

**This is the peak of our MVP logic! Let me know if the stock decrements correctly in your test run.**
