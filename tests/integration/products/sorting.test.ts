// ./tests/integration/products/sorting.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";

describe("Product Sorting", () => {
  beforeAll(async () => {
    // Clear products and seed specific prices
    await prisma.product.deleteMany({
      where: { name: { contains: "SortTest" } },
    });

    await prisma.product.create({
      data: {
        name: "SortTest Cheap",
        price: 10,
        stock: 10,
        description: "Testing sort",
      },
    });
    await prisma.product.create({
      data: {
        name: "SortTest Expensive",
        price: 500,
        stock: 10,
        description: "Testing sort",
      },
    });
  });

  it("should sort by price ascending (cheapest first)", async () => {
    const res = await request(app).get(
      "/api/products?sort=price_asc&q=SortTest",
    );

    // Use Number() to match types
    expect(Number(res.body.products[0].price)).toBe(10);
    expect(Number(res.body.products[1].price)).toBe(500);
  });

  it("should sort by price descending (expensive first)", async () => {
    const res = await request(app).get(
      "/api/products?sort=price_desc&q=SortTest",
    );

    expect(Number(res.body.products[0].price)).toBe(500);
    expect(Number(res.body.products[1].price)).toBe(10);
  });
});
