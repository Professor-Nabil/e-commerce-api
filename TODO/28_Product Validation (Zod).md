# 🛡️ Next Step: Product Validation (Zod)

To make this step bulletproof, I need to see your current **Product Controller** and your **Product Routes**. Specifically, I want to see how you're handling the request body right now.

**While you get those, let's prepare the schema.** Since your Prisma model has `name`, `description`, `price`, and `stock`, our Zod schema needs to match those types exactly.

**Create/Update File:** `src/schemas/product.schema.ts`

```typescript
import { z } from "zod";

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be a positive number"),
    stock: z.number().int().nonnegative("Stock cannot be negative"),
  }),
});
```

### 🧪 The TDD Plan

Before we apply the schema, we should write a test in `tests/product.test.ts` that sends a product **without a description** and expects a `400 Bad Request`.

```typescript
it("should return 400 if product description is missing", async () => {
  const adminRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "password123" });

  const res = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${adminRes.body.token}`)
    .send({
      name: "Broken Product",
      price: 100,
      stock: 5,
      // description is missing!
    });

  expect(res.statusCode).toEqual(400);
  expect(res.body.error.message).toContain("Description");
});
```

**Send me your `src/routes/product.routes.ts` and `src/controllers/product.controller.ts`.** I want to make sure we hook the `validate` middleware in the right spot!
