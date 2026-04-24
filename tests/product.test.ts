import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

describe("Product Management", () => {
  let adminToken: string;
  let customerToken: string;
  const adminEmail = "admin_prod@test.com";
  const password = "password123";

  beforeAll(async () => {
    // 1. Setup Admin via Manual DB Insert
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

    // 2. Setup a regular Customer for Negative Testing
    const customer = {
      email: "regular_user@test.com",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(customer);
    const customerLogin = await request(app)
      .post("/api/auth/login")
      .send(customer);
    customerToken = customerLogin.body.token;
  });

  describe("Product Protection & Roles", () => {
    it("should return 401 if a user tries to create a product without a token", async () => {
      const res = await request(app).post("/api/products").send({
        name: "Hacker Laptop",
        price: 999.99,
        stock: 5,
      });
      expect(res.statusCode).toEqual(401);
    });

    it("should return 403 if a CUSTOMER tries to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Illegal Product",
          description: "I should not be able to do this",
          price: 100,
          stock: 10,
        });
      expect(res.statusCode).toEqual(403);
    });

    it("should allow an ADMIN to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Mechanical Keyboard",
          description: "A very clicky and tactile keyboard",
          price: 150,
          stock: 10,
        });
      expect(res.statusCode).toEqual(201);
    });
  });

  describe("Product Validation", () => {
    it("should return 400 if product description is too short", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Pro Mouse",
          description: "Short",
          price: 50,
          stock: 100,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error.message).toContain(
        "Description must be at least 10 characters",
      );
    });
  });

  describe("Product Retrieval", () => {
    it("should return a product by its ID", async () => {
      const newProduct = {
        name: "Automatic Test Item",
        description: "This description is long enough for Zod",
        price: 29.99,
        stock: 50,
      };

      const createRes = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newProduct);

      const createdId = createRes.body.id;

      const res = await request(app).get(`/api/products/${createdId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(newProduct.name);
      expect(res.body.id).toEqual(createdId);
    });

    it("should return 404 if the product ID does not exist", async () => {
      // Use a valid UUID format that doesn't exist to avoid UUID validation errors
      const res = await request(app).get(
        "/api/products/00000000-0000-0000-0000-000000000000",
      );
      expect(res.statusCode).toEqual(404);
    });
  });
});
