// tests/integration/orders/order-details.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getCustomerToken } from "../../helpers/auth.helper.js";
import { prisma } from "../../../src/config/prisma.js";

describe("Order Details Access Control", () => {
  let userAToken: string;
  let userBToken: string;
  let orderAId: string;

  beforeAll(async () => {
    userAToken = await getCustomerToken("userA@test.com", "password123");
    userBToken = await getCustomerToken("userB@test.com", "password123");

    // 1. Create a category
    const category = await prisma.category.upsert({
      where: { name: "Electronics" },
      update: {},
      create: { name: "Electronics" },
    });

    // 2. Create the product (Implicit Many-to-Many Syntax)
    const product = await prisma.product.create({
      data: {
        name: "Test Laptop",
        price: 999.99,
        stock: 10,
        description: "High end laptop",
        categories: {
          connect: { id: category.id },
        },
      },
    });

    // 3. Add product to User A's cart
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ productId: product.id, quantity: 1 });

    // 4. Checkout
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${userAToken}`);

    orderAId = res.body.id;
  });

  it("should allow User A to view their own order", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderAId}`)
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(orderAId);
  });

  it("should prevent User B from viewing User A's order", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderAId}`)
      .set("Authorization", `Bearer ${userBToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error.message).toMatch(/Forbidden|own/i);
  });
});
