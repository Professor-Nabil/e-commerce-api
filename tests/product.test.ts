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

  // it("should allow an ADMIN to create a product", async () => {
  //   // 1. Register/Login as an Admin to get a token
  //   // (Assuming your registration logic defaults to ADMIN or you've seeded one)
  //   const loginRes = await request(app)
  //     .post("/api/auth/login")
  //     .send({ email: "admin@test.com", password: "password123" });
  //
  //   const token = loginRes.body.token;
  //
  //   // 2. Try to create the product with the token
  //   const res = await request(app)
  //     .post("/api/products")
  //     .set("Authorization", `Bearer ${token}`)
  //     .send({
  //       name: "Mechanical Keyboard",
  //       price: 150,
  //       stock: 10,
  //     });
  //
  //   expect(res.statusCode).toEqual(201);
  //   expect(res.body.name).toBe("Mechanical Keyboard");
  // });

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
