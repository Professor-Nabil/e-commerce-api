# 🌐 New Session: Filtering (Category & Price)

To make discovery useful, we need to allow users to narrow down the product list. We'll implement filters via query strings:

- `?categoryId=uuid`
- `?minPrice=10&maxPrice=500`

### 🛠️ 1. The Service Layer (`src/services/product.service.ts`)

We need to dynamically build the Prisma `where` clause.

```typescript
export const getAllProducts = async (
  page: number = 1,
  limit: number = 10,
  filters: { categoryId?: string; minPrice?: number; maxPrice?: number } = {},
) => {
  const skip = (page - 1) * limit;

  // Build dynamic where clause
  const where: any = {
    isDeleted: false,
    ...(filters.categoryId && {
      categories: { some: { id: filters.categoryId } },
    }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      },
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { categories: true, images: true },
      orderBy: { createdAt: "desc" },
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

### 🎮 2. The Controller (`src/controllers/product.controller.ts`)

Extract and sanitize the filter inputs.

```typescript
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters = {
      categoryId: req.query.categoryId as string,
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
    };

    const result = await ProductService.getAllProducts(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
```

### 📖 3. Swagger Update (`src/config/swagger.ts`)

Add the new parameters so you can test from the UI.

```typescript
// Inside GET /api/products parameters array:
{ name: "categoryId", in: "query", schema: { type: "string" }, description: "Filter by Category ID" },
{ name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimum price filter" },
{ name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maximum price filter" }
```

### 🧪 What to test next?

I'd suggest creating a new test file: `tests/integration/products/filtering.test.ts`.

In that file, we should:

1. Create 3 products with different prices (e.g., $10, $50, $100).
2. Filter for `maxPrice=60` and expect only 2 products.
3. Filter for a specific `categoryId` and ensure only matching products return.

Do you want me to generate that filtering test file for you, or should we verify the controller logic first?
