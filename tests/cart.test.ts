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

  it("should fetch the user's cart with full product details", async () => {
    // 1. Setup: Use the same customer from the previous test or a new one
    const customer = { email: "get_cart@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(customer);
    const loginRes = await request(app).post("/api/auth/login").send(customer);
    const token = loginRes.body.token;

    // 2. Add an item first so the cart isn't empty
    // We'll grab the productId from our existing automated product creation if possible,
    // or just create one quickly here.
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin_cart@test.com", password: "password123" });

    const prod = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminLogin.body.token}`)
      .send({
        name: "Monitor",
        description: "4K 27 inch display",
        price: 300,
        stock: 10,
      });

    // 2. Add an item (FIXED TYPO HERE)
    const addToCartRes = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`) // Space instead of ={
      .send({ productId: prod.body.id, quantity: 1 });

    // Safety check: ensure the item was actually added before we try to fetch the cart
    expect(addToCartRes.statusCode).toEqual(200);

    // 3. The Actual Test: Fetch the cart
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.items.length).toBeGreaterThan(0);

    // 4. Verify the "Include" worked (Product details should be nested)
    expect(res.body.items[0].product.name).toBe("Monitor");
    expect(res.body.items[0].product.price).toBeDefined();
  });
});
