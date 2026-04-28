Everything is looking great. Your `getAllProducts` service is already well-structured to handle dynamic inputs. To implement **Sorting**, we'll add a `sortBy` parameter that translates user-friendly strings (like `price_asc`) into Prisma-friendly `orderBy` objects.

### 🛠️ 1. Update the Service (`src/services/product.service.ts`)

We'll add a `sort` argument and a helper to map the strings to Prisma's sorting syntax.

```typescript
export const getAllProducts = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
  } = {},
  sort: string = "newest", // 👈 Add default sort
) => {
  const skip = (page - 1) * limit;

  // 1. Map sort string to Prisma orderBy
  const sortMap: Record<string, any> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
  };

  const orderBy = sortMap[sort] || sortMap.newest;

  const where: any = {
    isDeleted: false,
    // ... keep your existing where logic (categoryId, price, q)
    ...(filters.categoryId && {
      categories: { some: { id: filters.categoryId } },
    }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      },
    }),
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q } },
        { description: { contains: filters.q } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { categories: true, images: true },
      orderBy, // 👈 Use the mapped orderBy
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};
```

### 🎮 2. Update the Controller (`src/controllers/product.controller.ts`)

Pass the `sort` query parameter to the service.

```typescript
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "newest"; // 👈 Extract sort

    const filters = {
      // ... existing filters
      q: req.query.q as string,
      categoryId: req.query.categoryId as string,
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
    };

    const result = await ProductService.getAllProducts(
      page,
      limit,
      filters,
      sort,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};
```

### 🧪 3. Create Sorting Test (`tests/integration/products/sorting.test.ts`)

This test ensures that when we ask for `price_asc`, the first item is actually the cheapest.

```typescript
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

    expect(res.body.products[0].price).toBe(10);
    expect(res.body.products[1].price).toBe(500);
  });

  it("should sort by price descending (expensive first)", async () => {
    const res = await request(app).get(
      "/api/products?sort=price_desc&q=SortTest",
    );

    expect(res.body.products[0].price).toBe(500);
    expect(res.body.products[1].price).toBe(10);
  });
});
```

### 📖 4. Swagger documentation

Add this to your `parameters` array for `GET /api/products`:

```typescript
{
  name: "sort",
  in: "query",
  schema: {
    type: "string",
    enum: ["newest", "oldest", "price_asc", "price_desc"],
    default: "newest"
  },
  description: "Sort order for products"
}
```

Ready to implement this? It makes the "Discovery" experience much more natural—just like a real e-commerce site. Go ahead and apply these, run the tests, and let me know if they're green! 🟢
