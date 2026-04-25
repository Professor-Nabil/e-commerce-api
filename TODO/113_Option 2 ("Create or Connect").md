Option 2 ("Create or Connect") is the power-user choice. It means if you send a category name that doesn't exist, Prisma will handle the creation and the linking in a single transaction. This is perfect for a fast-moving backend.

Since we are doing "Create or Connect," we should work with **names** rather than IDs in the request body for the categories, as names are more human-readable in a JSON payload.

### 🛠️ Step 1: Update the Service

We need to modify the `createProduct` logic in `./src/services/product.service.ts` to handle the nested `connectOrCreate` logic.

```ts
export const createProduct = async (data: any) => {
  const { categoryNames, ...productData } = data;

  return await prisma.product.create({
    data: {
      ...productData,
      categories: {
        // This maps through your strings and tells Prisma:
        // "Find this by name, or create it if it's missing"
        connectOrCreate: categoryNames?.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: {
      categories: true,
    },
  });
};
```

---

### 🛠️ Step 2: Create Category Controller

Create `./src/controllers/category.controller.ts` so you can manage categories independently when needed.

```ts
import { Request, Response, NextFunction } from "express";
import * as CategoryService from "../services/category.service.js";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// Useful for pre-seeding categories
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    const category = await CategoryService.createCategory(name);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};
```

---

### 🛠️ Step 3: Define Routes

Add the category management to your routes. You might want to create a `category.routes.ts` or add them to your admin section.

**Example `./src/routes/category.routes.ts`:**

```ts
import { Router } from "express";
import {
  getCategories,
  addCategory,
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", getCategories); // Public: anyone can see categories
router.post("/", authenticate, authorize(["ADMIN"]), addCategory); // Admin only

export default router;
```

---

### 🛠️ Step 4: Update Zod Validation

Update `./src/schemas/product.schema.ts` to expect an array of strings for the names.

```ts
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    categoryNames: z.array(z.string()).optional(), // Change from IDs to strings
  }),
});
```

---

### 🧪 How to test this with `curl` or your PDE

When you hit your endpoint now, you can send this:

```json
{
  "name": "Keychron Q1",
  "description": "Mechanical Keyboard",
  "price": 160.0,
  "stock": 10,
  "categoryNames": ["Mechanical Keyboards", "PC Peripherals"]
}
```

If "Mechanical Keyboards" already exists, Prisma connects it. If "PC Peripherals" is new, Prisma creates it on the fly.

**Ready to run the migration?** 1. `npx prisma migrate dev --name add_categories` 2. Update the files above. 3. Run `npm run build` to see if `tsc` is still happy.

Let me know when the migration is done!
