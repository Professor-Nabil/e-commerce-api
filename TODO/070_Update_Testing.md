This is the final piece of the puzzle. By applying the **Manual DB Insert** pattern here, you are ensuring that your order history tests—which are the "receipts" of your entire system—are generated in a secure environment.

### 🧪 Updated `./tests/orders.test.ts`

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

describe("Order History System", () => {
  let customerToken: string;
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    // 1. Manual DB Insert for Admin (Secure way to get ADMIN role)
    const adminEmail = "admin_order@test.com";
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

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password });
    adminToken = adminLogin.body.token;

    // 2. Create Product via Admin Token
    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Mechanical Keyboard",
        description: "Blue Switches",
        price: 150,
        stock: 50,
      });
    productId = prod.body.id;

    // 3. Setup Customer via Public API (Role defaults to CUSTOMER)
    const customer = {
      email: "order_viewer@test.com",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(customer);
    const customerLogin = await request(app)
      .post("/api/auth/login")
      .send(customer);
    customerToken = customerLogin.body.token;
  });

  it("should return an empty array if the user has no orders", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should record an order and retrieve it in history", async () => {
    // 1. Add item to cart
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 2 });

    // 2. Checkout
    await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${customerToken}`);

    // 3. Fetch History
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);

    const order = res.body[0];
    expect(Number(order.totalAmount)).toBe(300);
    expect(order.status).toBe("COMPLETED");

    // 4. Verify Snapshot Integrity (Crucial for e-commerce quality)
    // We check that the order item has the product name from the relation
    // and the historical price is stored correctly.
    expect(order.items[0].product.name).toBe("Mechanical Keyboard");
    expect(Number(order.items[0].price)).toBe(150);
  });
});
```

---

### ✅ The Milestone Check

You have successfully refactored your entire test suite to match a **Production Security Model**. Here is what we've achieved in this "Quality" push:

1. **Immutable Admin Setup**: Admins are now only created through direct database access (Prisma Seed or Manual Insert), preventing any public "role-hacking."
2. **Referential Integrity**: Your order history tests prove that even after a checkout, the relationship between `Order` -> `OrderItem` -> `Product` is preserved and readable.
3. **Isolation**: Every test file now handles its own state independently.

### 💾 Final Commit Instructions

Since you've updated `auth.service.ts`, `swagger.ts`, and all three major test files, this is a perfect time for a clean commit.

**Suggested Commit Message:**

```bash
git commit -m "refactor(security): harden auth and update test suites

- Enforce CUSTOMER role as default in registration service
- Implement prisma/seed.ts for secure admin bootstrapping
- Refactor cart, checkout, and order tests to use manual DB injection for admins
- Update Swagger documentation to reflect restricted role property"
```

**Excellent work today, Nabil.** You've taken this from a simple coding challenge to a legitimate, architecturally sound API. Ready to push?
