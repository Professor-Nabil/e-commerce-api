This is where the cleanup really starts to pay off. By swapping out those bulky `beforeAll` blocks for your new helper functions, your tests become focused entirely on the **logic of the cart and orders**.

Here are the refactored versions of both files.

### 🛒 1. Refactor: `./tests/integration/cart/cart.test.ts`

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("Shopping Cart Flow", () => {
  let adminToken: string;

  beforeAll(async () => {
    // Uses the helper to inject the admin and get the token
    adminToken = await getAdminToken("admin_cart@test.com");
  });

  it("should create a product as admin and add it to cart as customer", async () => {
    // 1. Create Product
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

    // 2. Get Customer Token via Helper
    const customerToken = await getCustomerToken("customer_cart@test.com");

    // 3. Add to cart flow (checking cumulative quantity)
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
    const token = await getCustomerToken("get_cart@test.com");

    // Create a product
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
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: prod.body.id, quantity: 1 });

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

---

### 📦 2. Refactor: `./tests/integration/orders/orders.test.ts`

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("Order History System", () => {
  let customerToken: string;
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    // 1. Get Tokens
    adminToken = await getAdminToken("admin_order@test.com");
    customerToken = await getCustomerToken("order_viewer@test.com");

    // 2. Create Product for use in these tests
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

    // 4. Verify Snapshot Integrity
    expect(order.items[0].product.name).toBe("Mechanical Keyboard");
    expect(Number(order.items[0].price)).toBe(150);
  });
});
```

---

### 🧐 Observations for your Learning

Notice how the `orders.test.ts` file went from being a "setup nightmare" to a clean description of the business logic:

1. Check empty state.
2. Add to cart.
3. Checkout.
4. Verify history.

Since you're doing **everything through the terminal**, you'll appreciate that when a test fails now, the stack trace won't be buried under lines of `bcrypt.hash` or `prisma.upsert` code. It will point directly to your `supertest` requests.

**Next Step:** Are you ready to tackle the `auth.test.ts` or the `checkout.test.ts` (E2E) next? The E2E one will look particularly clean with these helpers.
