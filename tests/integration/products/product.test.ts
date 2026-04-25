// ./tests/integration/products/product.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("Product Management Integration", () => {
  let adminToken: string;
  let customerToken: string;
  let targetProductId: string; // 👈 Define it here for the whole suite

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_prod@test.com");
    customerToken = await getCustomerToken("regular_user@test.com");
  });

  describe("Product Protection & Roles", () => {
    it("should return 403 if a CUSTOMER tries to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Illegal Product",
          description: "Unauthorized creation attempt",
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

  it("should create a product with an image", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Test Product") // Use .field for text
      .field("description", "A valid description for testing")
      .field("price", 99.99)
      .field("stock", 10)
      .attach("images", "tests/fixtures/test-image.png"); // Path to a small test image

    expect(response.status).toBe(201);
    expect(response.body.images).toHaveLength(1);
  });

  describe("POST /api/products (Creation)", () => {
    it("should create a product with an image", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("name", "Test Product")
        .field("description", "A valid description for testing")
        .field("price", 99.99)
        .field("stock", 10)
        .attach("images", "tests/fixtures/test-image.png");

      expect(response.status).toBe(201);
      expect(response.body.images).toHaveLength(1);

      // 👈 Save this ID for the PATCH tests below
      targetProductId = response.body.id;
    });
  });

  describe("PATCH /api/products/:id (Multipart Update)", () => {
    it("should update product price and add an image via multipart/form-data", async () => {
      const res = await request(app)
        .patch(`/api/products/${targetProductId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("price", "199.99") // Sent as string, coerced by controller
        .attach("images", "tests/fixtures/test-image.png");

      expect(res.statusCode).toBe(200);
      expect(Number(res.body.price)).toBe(199.99);
      // Check that the new image was added to the array
      expect(res.body.images).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ url: expect.stringContaining("uploads/") }),
        ]),
      );
    });

    it("should handle partial updates without files", async () => {
      const res = await request(app)
        .patch(`/api/products/${targetProductId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("stock", "50");

      expect(res.statusCode).toBe(200);
      expect(res.body.stock).toBe(50);
    });
  });
});
