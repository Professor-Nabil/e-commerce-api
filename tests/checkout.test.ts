import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

describe("Checkout System", () => {
  let adminToken: string;
  const adminEmail = "admin_checkout@test.com";
  const password = "password123";

  beforeAll(async () => {
    // 1. Manual DB Insert for Admin (Bypassing restricted register route)
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

    // Login once to get a token used throughout the suite
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password });

    adminToken = adminLogin.body.token;
  });

  it("should complete checkout, create an order, and decrement stock", async () => {
    // 2. Create Product (using adminToken)
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

    // 3. Setup Customer & Add 2 to Cart
    const customer = { email: "buyer@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(customer);
    const login = await request(app).post("/api/auth/login").send(customer);
    const token = login.body.token;

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId, quantity: 2 });

    // 4. Checkout
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(201);
    expect(Number(res.body.totalAmount)).toBe(4000);

    // 5. Verify Stock Integrity
    const updatedProd = await prisma.product.findUnique({
      where: { id: productId },
    });
    expect(updatedProd?.stock).toBe(8);

    // 6. Verify Cart is empty
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
    // Create fresh product with low stock
    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
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
