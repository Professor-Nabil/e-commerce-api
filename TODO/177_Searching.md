# 🌐 New Session: Keyword Searching (`?q=keyword`)

To implement searching, we’ll use Prisma's `contains` filter. We want the search to look at both the **name** and the **description** of the product.

### 🛠️ 1. Update the Service (`src/services/product.service.ts`)

Modify the `filters` type and the `where` clause to include the search term `q`.

```typescript
export const getAllProducts = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string; // 👈 Add this
  } = {},
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    isDeleted: false,
    // ... (keep category and price logic)
    ...(filters.categoryId && {
      categories: { some: { id: filters.categoryId } },
    }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      },
    }),
    // 🔍 ADD SEARCH LOGIC HERE
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q } },
        { description: { contains: filters.q } },
      ],
    }),
  };

  // ... (rest of the Promise.all stays same)
};
```

### 🎮 2. Update the Controller (`src/controllers/product.controller.ts`)

Just grab `q` from the query string.

```typescript
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters = {
      q: req.query.q as string, // 👈 Extract search query
      categoryId: req.query.categoryId as string,
      // ... (minPrice/maxPrice logic)
    };

    // ...
```

### 🧪 3. Create Search Test (`tests/integration/products/search.test.ts`)

You can create a small test file to verify that searching "Keyboard" doesn't return "Mouse".

```typescript
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
```

**Ready to apply the search logic?** I'll be here if Prisma throws any "contains" errors (usually happens if the DB provider doesn't support case-insensitive searches by default, but MySQL handles this well).
