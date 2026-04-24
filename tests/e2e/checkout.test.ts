// ./tests/e2e/checkout.test.ts
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

  it("should fail to add to cart if stock is insufficient", async () => {
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

    // 1. Try to add 2 when only 1 exists - THIS should fail now
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: prod.body.id, quantity: 2 });

    expect(res.statusCode).toEqual(400);
    // Since we used AppError, it should return the custom message
    expect(res.body.error.message).toContain("Insufficient stock");
  });
});
