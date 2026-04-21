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

describe("Product Validation", () => {
  it("should return 400 if product description is too short", async () => {
    // 1. Get Admin Token (assuming admin@test.com is registered in your setup or previous test)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password123" });

    const token = loginRes.body.token;

    // 2. Try to create product with short description
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Pro Mouse",
        description: "Too short",
        price: 50,
        stock: 100,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toContain(
      "Description must be at least 10 characters",
    );
  });
});

describe("GET /api/products/:id", () => {
  it("should return a product by its ID", async () => {
    // 1. Get Admin Token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password123" });

    const token = loginRes.body.token;

    // 2. Create a product first
    const newProduct = {
      name: "Automatic Test Item",
      description: "This description is long enough for Zod",
      price: 29.99,
      stock: 50,
    };

    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(newProduct);

    const createdId = createRes.body.id; // Capture the ID from the response

    // 3. Fetch it by ID
    const res = await request(app).get(`/api/products/${createdId}`);

    // 4. Expect 200 and the correct product name
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(newProduct.name);
    expect(res.body.id).toEqual(createdId);
  });

  it("should return 404 if the product ID does not exist", async () => {
    const res = await request(app).get("/api/products/9999");
    expect(res.statusCode).toEqual(404);
  });
});
