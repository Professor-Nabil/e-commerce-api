Glad to hear those tests are green!

Regarding the **Swagger Update**, it's all about making sure your documentation reflects your new features. Since your API can now handle filters like `minPrice` or `categoryId`, we need to tell Swagger to show those input fields in the UI.

### 📖 1. The Swagger Edit

Find the `GET` section for `/api/products` in your `src/config/swagger.ts` and add the three new objects to the `parameters` array:

```ts
    // PRODUCT ENDPOINTS
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List all products (Paginated & Filtered)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          // --- ADD THESE NEW FILTERS BELOW ---
          {
            name: "categoryId",
            in: "query",
            schema: { type: "string" },
            description: "Filter products by Category UUID",
          },
          {
            name: "minPrice",
            in: "query",
            schema: { type: "number" },
            description: "Filter products with price greater than or equal to",
          },
          {
            name: "maxPrice",
            in: "query",
            schema: { type: "number" },
            description: "Filter products with price less than or equal to",
          },
        ],
        // ... (rest of the responses section stays the same)
      }
    }
```

---

### 🧪 2. The New Test File

Let's create `tests/integration/products/filtering.test.ts`. This test will ensure that our Prisma "where" logic actually filters the data correctly.

```ts
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
```

### 🚀 Verification

1. Apply the **Service** and **Controller** logic for filtering if you haven't yet.
2. Run the new test:

    ```bash
    npx vitest tests/integration/products/filtering.test.ts
    ```

Once this is green, your Discovery feature is pretty much elite. What do you think—ready to give it a spin?
