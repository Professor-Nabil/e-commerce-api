Moving into **Pagination** is a great move. As your database grows, fetching thousands of products at once will slow down your terminal tools and the API itself.

Since we are using Prisma, we’ll use **Offset Pagination** (`skip` and `take`), which is the easiest to implement for a REST API.

---

### 🛠️ 1. The Service Layer (`src/services/product.service.ts`)

We need to update `getAllProducts` to accept `page` and `limit`. We also want to return the **total count** so the frontend knows how many pages exist.

```typescript
export const getAllProducts = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  // We run these in parallel for better performance
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        categories: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: { isDeleted: false } }),
  ]);

  return {
    products,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
```

---

### 🎮 2. The Controller (`src/controllers/product.controller.ts`)

Extract the query parameters and pass them to the service.

```typescript
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await ProductService.getAllProducts(page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
```

---

### 📖 3. Swagger Documentation (`src/config/swagger.ts`)

Update the `GET /api/products` definition to include query parameters.

```typescript
"/api/products": {
  get: {
    tags: ["Products"],
    summary: "Get all products (Paginated)",
    parameters: [
      {
        name: "page",
        in: "query",
        schema: { type: "integer", default: 1 },
        description: "Page number"
      },
      {
        name: "limit",
        in: "query",
        schema: { type: "integer", default: 10 },
        description: "Number of items per page"
      }
    ],
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                products: { type: "array", items: { $ref: "#/components/schemas/Product" } },
                meta: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    totalPages: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

### 🧪 4. Quick Testing Tip

Since you have quite a few products from your previous manual tests, you can test this immediately in your terminal using `curl` or `httpie`:

```bash
# Get page 1 with only 2 items
curl "http://localhost:3000/api/products?page=1&limit=2"
```

### 💡 Potential Issue Warning

Wait! Before you apply this, check your **Existing Tests** for products (`tests/integration/products/product.test.ts`). They might fail because they expect the response to be an **array**, but now we are returning an **object** with `{ products, meta }`.

**Do you want me to help you refactor those tests first, or are you comfortable updating the `expect(res.body)` to `expect(res.body.products)` on your own?**
