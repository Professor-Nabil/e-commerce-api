// ./tests/integration/orders/orders.test.ts
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
