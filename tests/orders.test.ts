import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

describe("Order History System", () => {
  let customerToken: string;
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    // 1. Manual DB Insert for Admin (Secure way to get ADMIN role)
    const adminEmail = "admin_order@test.com";
    const password = "password123";
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

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password });
    adminToken = adminLogin.body.token;

    // 2. Create Product via Admin Token
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

    // 3. Setup Customer via Public API (Role defaults to CUSTOMER)
    const customer = {
      email: "order_viewer@test.com",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(customer);
    const customerLogin = await request(app)
      .post("/api/auth/login")
      .send(customer);
    customerToken = customerLogin.body.token;
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

    // 4. Verify Snapshot Integrity (Crucial for e-commerce quality)
    // We check that the order item has the product name from the relation
    // and the historical price is stored correctly.
    expect(order.items[0].product.name).toBe("Mechanical Keyboard");
    expect(Number(order.items[0].price)).toBe(150);
  });
});
