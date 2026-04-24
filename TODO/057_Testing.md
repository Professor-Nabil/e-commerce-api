Quality choice. Keeping test files modular (around 100-150 lines) makes them much easier to navigate in Neovim and ensures your CI runs aren't bogged down by massive individual files.

Since we are focusing on **Quality**, we'll make this test file a complete "Audit" of the order system. It will ensure that after a checkout, the history isn't just a list, but a detailed, accurate record of the transaction.

### 🧪 Step 1: The Test Audit

**File:** `./tests/orders.test.ts`

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Order History System", () => {
  let customerToken: string;
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    // 1. Setup Admin & Product
    const admin = {
      email: "admin_order@test.com",
      password: "password123",
      role: "ADMIN",
    };
    await request(app).post("/api/auth/register").send(admin);
    const adminLogin = await request(app).post("/api/auth/login").send(admin);
    adminToken = adminLogin.body.token;

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

    // 2. Setup Customer
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

    // 4. Verify nested relational data (The 'Quality' check)
    expect(order.items[0].product.name).toBe("Mechanical Keyboard");
    expect(Number(order.items[0].price)).toBe(150);
  });
});
```

---

### 🧐 Why this structure matters

1. **`beforeAll`**: We use this to keep the actual `it` blocks clean and focused on the logic.
2. **Snapshot of Price**: We are testing that `order.items[0].price` exists. This is crucial because even if the Admin changes the product price to $200 later, this historical record must stay at $150.
3. **Authentication Isolation**: We are proving that `getOrderHistory` respects the `userId` attached to the token.

### 🚀 Next Steps

1. Save the test file.
2. Run `npx vitest run tests/orders.test.ts`.
3. Once it passes, you've officially finished the **Core MVP Flow**.

**You have about an hour left of your window—this is the perfect time for that final commit.**
