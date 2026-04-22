import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Checkout System", () => {
  it("should complete checkout, create an order, and decrement stock", async () => {
    // 1. Setup Admin: REGISTER first, then LOGIN
    const admin = {
      email: "admin_checkout@test.com",
      password: "password123",
      role: "ADMIN",
    };

    // Register the admin
    await request(app).post("/api/auth/register").send(admin);

    // Login the admin
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: admin.password });

    expect(adminLogin.statusCode).toBe(200);
    const adminToken = adminLogin.body.token;

    // 2. Create Product
    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "GPU",
        description: "RTX 5090 Super",
        price: 2000,
        stock: 10,
      });

    expect(prod.statusCode).toBe(201);
    const productId = prod.body.id;

    // 2. Setup Customer & Add 2 to Cart
    const customer = { email: "buyer@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(customer);
    const login = await request(app).post("/api/auth/login").send(customer);
    const token = login.body.token;

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

    // 4. Verify Stock is now 8
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
    const customer = { email: "empty_cart@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(customer);
    const login = await request(app).post("/api/auth/login").send(customer);

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toBe("Cart is empty");
  });

  it("should fail checkout if stock is insufficient", async () => {
    // We already have a product 'GPU' from the first test in the same DB
    // but it's safer to create a fresh one with low stock
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin_checkout@test.com", password: "password123" });

    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminLogin.body.token}`)
      .send({
        name: "Limited Item",
        description: "Only 1 left",
        price: 10,
        stock: 1,
      });

    const customer = {
      email: "unlucky_buyer@test.com",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(customer);
    const login = await request(app).post("/api/auth/login").send(customer);
    const token = login.body.token;

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
