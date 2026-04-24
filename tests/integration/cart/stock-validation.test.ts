import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";
import { getCustomerToken } from "../../helpers/auth.helper.js";

describe("Cart Stock Validation", () => {
  let userToken: string;
  let limitedProductId: string;

  beforeAll(async () => {
    userToken = await getCustomerToken("stock_tester@test.com");

    const product = await prisma.product.create({
      data: {
        name: "Limited Edition Keycap",
        description: "Only a few in existence.",
        price: 50,
        stock: 5, // Only 5 in stock
      },
    });
    limitedProductId = product.id;
  });

  it("should fail if user tries to add more than available stock", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId: limitedProductId, quantity: 10 });

    expect(res.statusCode).toBe(400);
    // Note: We might need to handle this error specifically in our error middleware
    expect(res.body.error.message).toContain("Insufficient stock");
  });

  it("should fail if user updates quantity to exceed stock", async () => {
    // Add valid amount first
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId: limitedProductId, quantity: 1 });

    // Try to update to 10
    const res = await request(app)
      .patch(`/api/cart/${limitedProductId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.statusCode).toBe(400);
  });
});
