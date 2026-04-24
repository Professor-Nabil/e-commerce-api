# 🔍 Next Step: The "Get One" Route (`GET /api/products/:id`)

To build this, we need to handle a specific edge case: **What if the ID doesn't exist?** In a REST API, we should return a `404 Not Found` instead of a empty object or a `500` error.

#### 1. The Service Logic

Add this to your `src/services/product.service.ts`:

```typescript
export const getProductById = async (id: number) => {
  return await prisma.product.findUnique({
    where: { id },
  });
};
```

#### 2. The Controller Logic

Update your `src/controllers/product.controller.ts`:

```typescript
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(Number(id));

    if (!product) {
      return res.status(404).json({ error: { message: "Product not found" } });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};
```

#### 3. The Route

Add this to `src/routes/product.routes.ts`:

```typescript
import {
  getProducts,
  createProduct,
  getProductById, // import
} from "../controllers/product.controller.js";
// GET /api/products/123
router.get("/:id", getProductById);
```

---

### 🧪 The TDD Challenge

Before you run this, let's add two test cases to `tests/product.test.ts` to make sure it handles both success and failure perfectly:

```typescript
describe("GET /api/products/:id", () => {
  it("should return a product by its ID", async () => {
    // 1. Create a product first (or use one from the DB)
    // 2. Fetch it by ID
    // 3. Expect 200 and the correct product name
  });

  it("should return 404 if the product ID does not exist", async () => {
    const res = await request(app).get("/api/products/9999");
    expect(res.statusCode).toEqual(404);
  });
});
```

### ❓ Quick Question

Since we are using **MariaDB** with auto-incrementing IDs, do you want to add a Zod validation for the `:id` parameter too? (e.g., ensuring it's a positive integer before it even hits the database).

**Once you've added the code, let me know if those 2 new tests pass!**
