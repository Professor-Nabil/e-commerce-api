Since we are using **Option B** and creating a fresh `database_test` for every run, we need to bypass the public `/api/auth/register` for the Admin role entirely. We'll use the `prisma` client directly in our `beforeAll` or inside the `it` blocks to inject the Admin.

This keeps your tests "Quality" by ensuring the public API is never used for privilege escalation.

### 🧪 Updated `./tests/cart.test.ts`

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

describe("Shopping Cart Flow", () => {
  let adminToken: string;

  beforeAll(async () => {
    // 1. Manual DB Insert for Admin (Bypassing restricted register route)
    const adminEmail = "admin_cart@test.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Login to get the admin token for product creation
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password });

    adminToken = adminLogin.body.token;
  });

  it("should create a product as admin and add it to cart as customer", async () => {
    // 2. Create Product (using the adminToken from beforeAll)
    const prodRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Laptop",
        description: "A high-end gaming laptop for testing",
        price: 1200,
        stock: 5,
      });
    const productId = prodRes.body.id;

    // 3. Setup Customer (via public API - role defaults to CUSTOMER)
    const customer = {
      email: "customer_cart@test.com",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(customer);
    const customerLogin = await request(app)
      .post("/api/auth/login")
      .send(customer);
    const customerToken = customerLogin.body.token;

    // 4. Add to cart flow (checking cumulative quantity)
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 1 });

    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 2 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.productId).toBe(productId);
    expect(res.body.quantity).toBe(3); // 1 + 2 = 3
  });

  it("should fetch the user's cart with full product details", async () => {
    const customer = { email: "get_cart@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(customer);
    const loginRes = await request(app).post("/api/auth/login").send(customer);
    const token = loginRes.body.token;

    // Create a product via adminToken
    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Monitor",
        description: "4K 27 inch display",
        price: 300,
        stock: 10,
      });

    // Add to Cart
    const addToCartRes = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: prod.body.id, quantity: 1 });

    expect(addToCartRes.statusCode).toEqual(200);

    // Fetch Cart
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0].product.name).toBe("Monitor");
  });
});
```

### 🧐 Why this is "Quality" Isolation

1. **Strict Security**: Your test now accurately simulates reality—no one can register as an Admin. You only get an Admin account if it's already in the DB (inserted by you, the dev).
2. **`upsert`**: Using `upsert` in `beforeAll` prevents errors if the test runs multiple times without a clean database wipe, though you mentioned you create a new one every time, which is even better.
3. **Dependency Injection**: The tests don't rely on the `seed-first-admin.ts` file, meaning if you change your seed data later, your tests won't break.

---

### 🚀 Final Check Before Commit

1. Run `npx vitest run tests/cart.test.ts`.
2. Check `tests/checkout.test.ts` and `tests/orders.test.ts` to ensure they also use this **Manual DB Insert** for their admins.
3. Ensure your `src/services/auth.service.ts` register function is hardcoded to `CUSTOMER`.

Once these pass, you have a solid, professional-grade security architecture. **Ready to commit?**
