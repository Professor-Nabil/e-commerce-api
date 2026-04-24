To implement **Update** and **Soft Delete**, we need to modify our database schema first, then build the logic. Here is the game plan for this sprint:

---

### 1. Database Layer: The Schema Update

We need a way to mark a product as "deleted" without actually removing it from the database. This ensures that old `OrderItems` don't lose their reference to the product.

**Edit your `./prisma/schema.prisma`:**
Add the `isDeleted` and `deletedAt` fields to the `Product` model.

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)

  // New Fields for Soft Delete
  isDeleted   Boolean  @default(false)
  deletedAt   DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  cartItems   CartItem[]
  orderItems  OrderItem[]
}
```

> **Action:** Run `npx prisma migrate dev --name add_soft_delete_to_products` to update your MariaDB.

---

### 2. Validation Layer: New Schemas

We need a schema for **Update**. It should be similar to `CreateProductSchema`, but every field should be optional (since you might only want to update the price, not the name).

**Edit `./src/schemas/product.schema.ts`:**

```ts
import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

// For Update: Use .partial() to make all fields optional
export const UpdateProductSchema = CreateProductSchema.partial();
```

---

### 3. Service Layer: Business Logic

We need to update our service to handle the patch and the soft delete. We also need to update `getAllProducts` so that customers don't see deleted items!

**Edit `./src/services/product.service.ts`:**

```ts
export const getAllProducts = async () => {
  return await prisma.product.findMany({
    where: { isDeleted: false }, // Only show active products
    orderBy: { createdAt: "desc" },
  });
};

export const updateProduct = async (
  id: string,
  data: Prisma.ProductUpdateInput,
) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};

export const softDeleteProduct = async (id: string) => {
  return await prisma.product.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};
```

---

### 4. Controller Layer: Handling Requests

Now we wire them up to Express.

**Edit `./src/controllers/product.controller.ts`:**

```ts
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await ProductService.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await ProductService.softDeleteProduct(req.params.id);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
};
```

---

### 5. Routing Layer: Protected Admin Routes

Finally, expose the endpoints. Only Admins should touch these.

**Edit `./src/routes/product.routes.ts`:**

```ts
import { UpdateProductSchema } from "../schemas/product.schema.js";
import {
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

// ... existing routes ...

// Update a product
router.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate(UpdateProductSchema),
  updateProduct,
);

// Soft Delete a product
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteProduct);
```

---

### 🧪 What about the tests?

Since we have our structure ready, you should create a new test file: `./tests/integration/products/admin-product.test.ts`.

I need you to confirm: **Do you want to write the integration tests for these new Admin routes now, or should we verify them with a simple `curl` first?** (I know you love testing, so I'm betting on the integration tests!)
