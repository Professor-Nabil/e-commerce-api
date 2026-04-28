import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";
import { getAdminToken } from "../../helpers/auth.helper.js";

describe("Product Filtering Integration", () => {
  let adminToken: string;
  let catElectronicsId: string;
  let catBooksId: string;

  beforeAll(async () => {
    adminToken = await getAdminToken("filter_admin@test.com");

    // 1. Setup Categories
    const catElectronics = await prisma.category.create({
      data: { name: "Electronics_Filter" },
    });
    const catBooks = await prisma.category.create({
      data: { name: "Books_Filter" },
    });
    catElectronicsId = catElectronics.id;
    catBooksId = catBooks.id;

    // 2. Setup 3 Products with specific prices and categories
    await prisma.product.create({
      data: {
        name: "Cheap Book",
        price: 10,
        stock: 5,
        description: "A very cheap book for testing",
        categories: { connect: { id: catBooksId } },
      },
    });

    await prisma.product.create({
      data: {
        name: "Mid-range Phone",
        price: 50,
        stock: 5,
        description: "A mid-range phone for testing",
        categories: { connect: { id: catElectronicsId } },
      },
    });

    await prisma.product.create({
      data: {
        name: "Expensive Laptop",
        price: 100,
        stock: 5,
        description: "A very expensive laptop for testing",
        categories: { connect: { id: catElectronicsId } },
      },
    });
  });

  it("should filter by maxPrice=60", async () => {
    const res = await request(app).get("/api/products?maxPrice=60");

    expect(res.statusCode).toBe(200);
    // Should find the Book ($10) and the Phone ($50), but not the Laptop ($100)
    // Note: Other products from previous tests might exist, but they must all be <= 60
    res.body.products.forEach((p: any) => {
      expect(Number(p.price)).toBeLessThanOrEqual(60);
    });
  });

  it("should filter by categoryId", async () => {
    const res = await request(app).get(
      `/api/products?categoryId=${catBooksId}`,
    );

    expect(res.statusCode).toBe(200);
    // Should only find products linked to the "Books_Filter" category
    res.body.products.forEach((p: any) => {
      const hasCategory = p.categories.some((c: any) => c.id === catBooksId);
      expect(hasCategory).toBe(true);
    });
  });

  it("should combine filters (Price + Category)", async () => {
    // Electronics between $10 and $60 (Should only return the Phone)
    const res = await request(app).get(
      `/api/products?categoryId=${catElectronicsId}&minPrice=10&maxPrice=60`,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].name).toBe("Mid-range Phone");
  });
});
