import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Product Protection", () => {
  it("should return 401 if a user tries to create a product without a token", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Hacker Laptop",
      price: 999.99,
      stock: 5,
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should allow an ADMIN to create a product", async () => {
    const adminCredentials = {
      email: "admin@test.com",
      password: "password123",
      role: "ADMIN", // Add this!
    };

    // 1. Register with ADMIN role
    await request(app).post("/api/auth/register").send(adminCredentials);

    // 2. Login
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send(adminCredentials);
    const token = loginRes.body.token;

    // 3. Try to create the product
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Mechanical Keyboard",
        description: "A very clicky keyboard", // Added description to match schema
        price: 150,
        stock: 10,
      });

    expect(res.statusCode).toEqual(201);
  });
});
