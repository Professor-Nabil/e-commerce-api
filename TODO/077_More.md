This is looking much cleaner, Nabil. By using the helpers in your E2E tests, we can finally see the "User Journey" clearly without the DB boilerplate getting in the way.

Here are the refactored versions. I've also kept `auth.test.ts` focused on the raw requests since that's specifically testing the registration/login logic itself.

---

### 🧪 1. Refactor: `./tests/integration/auth/auth.test.ts`

I kept this mostly as-is, but updated the import path to match your new directory structure. Since this _is_ the auth test, it makes sense to use `request(app)` directly here rather than the helper.

```ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";

describe("Auth Endpoints Integration", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("test@example.com");
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toContain("Invalid email");
  });

  it("should login an existing user and return a token", async () => {
    const credentials = { email: "login@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(credentials);

    const res = await request(app).post("/api/auth/login").send(credentials);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
```

---

### 🚀 2. Refactor: `./tests/e2e/checkout.test.ts`

This is where the magic happens. Look how the `beforeAll` and the customer setups are now single-line calls.

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { getAdminToken, getCustomerToken } from "../helpers/auth.helper.js";

describe("Checkout System E2E", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_checkout@test.com");
  });

  it("should complete checkout, create an order, and decrement stock", async () => {
    // 1. Create Product (as Admin)
    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "GPU",
        description: "RTX 5090 Super",
        price: 2000,
        stock: 10,
      });
    const productId = prod.body.id;

    // 2. Setup Customer & Add 2 to Cart
    const token = await getCustomerToken("buyer@test.com");

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

    // 4. Verify Stock Integrity
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

  it("should fail checkout if cart is empty", async () => {
    const token = await getCustomerToken("empty_cart@test.com");

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toBe("Cart is empty");
  });

  it("should fail checkout if stock is insufficient", async () => {
    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Limited Item",
        description: "Only 1 left in stock",
        price: 10,
        stock: 1,
      });

    const token = await getCustomerToken("unlucky_buyer@test.com");

    // Add 2 to cart when only 1 exists
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: prod.body.id, quantity: 2 });

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toContain("Not enough stock");
  });
});
```

---

### 🏁 Time to Commit

Your structure is now highly organized and follows the **Separation of Concerns** principle. You have:

1. **Helpers** handling the boring DB stuff.
2. **Integration** tests verifying each module.
3. **E2E** tests verifying the money-making workflows.

Since everything is in place, run your commit:

You've built a very professional testing environment. It’s a bit rare to see a dev organize their tests this well so early in a project—Arch users really do love their systems clean! 🏛️

What's next on the `PLAN.md`? Are we adding more features or refining the backend further?
