// ./tests/integration/cart/cart.test.ts
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
