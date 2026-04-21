import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Shopping Cart Flow", () => {
  it("should create a product as admin and add it to cart as customer", async () => {
    // 1. Setup Admin and Product
    const admin = {
      email: "admin_cart@test.com",
      password: "password123",
      role: "ADMIN",
    };
    await request(app).post("/api/auth/register").send(admin);
    const adminLogin = await request(app).post("/api/auth/login").send(admin);

    const prodRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminLogin.body.token}`)
      .send({
        name: "Test Laptop",
        description: "A high-end gaming laptop for testing",
        price: 1200,
        stock: 5,
      });
    const productId = prodRes.body.id;

    // 2. Setup Customer
    const customer = {
      email: "customer_cart@test.com",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(customer);
    const customerLogin = await request(app)
      .post("/api/auth/login")
      .send(customer);
    const customerToken = customerLogin.body.token;

    // 3. Add to cart first time (Quantity 1)
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 1 });

    // 4. Add to cart second time (Quantity 2)
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 2 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.productId).toBe(productId);
    expect(res.body.quantity).toBe(3); // 1 + 2 = 3
  });
});
