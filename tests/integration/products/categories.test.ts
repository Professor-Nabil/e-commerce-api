import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken } from "../../helpers/auth.helper.js";

describe("Category Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_cat@test.com");
  });

  it("should create new categories when creating a product", async () => {
    const productData = {
      name: "Mechanical Keyboard",
      description: "Description must be at least 10 characters",
      price: 150,
      stock: 10,
      categoryNames: ["Hardware", "PC"],
    };

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(productData);

    expect(res.statusCode).toBe(201);
    expect(res.body.categories).toHaveLength(2);
    expect(res.body.categories.map((c: any) => c.name)).toContain("Hardware");
  });

  it("should list all categories", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // At least the 2 from the previous test should exist
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});
