import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";

describe("Product Search", () => {
  beforeAll(async () => {
    await prisma.product.create({
      data: {
        name: "Gaming Keyboard",
        description: "RGB mechanical keys",
        price: 80,
        stock: 10,
      },
    });
    await prisma.product.create({
      data: {
        name: "Office Mouse",
        description: "Quiet click wireless mouse",
        price: 20,
        stock: 10,
      },
    });
  });

  it("should find 'Keyboard' in the name", async () => {
    const res = await request(app).get("/api/products?q=Keyboard");
    expect(
      res.body.products.some((p: any) => p.name === "Gaming Keyboard"),
    ).toBe(true);
    expect(res.body.products.every((p: any) => p.name !== "Office Mouse")).toBe(
      true,
    );
  });

  it("should find 'mechanical' in the description", async () => {
    const res = await request(app).get("/api/products?q=mechanical");
    expect(res.body.products[0].name).toBe("Gaming Keyboard");
  });
});
