To get `updateProduct` working with images, we need to apply the same logic we used for creation: extracting the files and coercing the types. Since `PATCH` requests usually send partial data, we’ll use the `??` operator to ensure we don't accidentally turn valid numbers into `NaN` if they aren't provided in the update.

### 🛠️ 1. Update `product.controller.ts`

Replace your existing `updateProduct` function with this version.

```typescript
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extract files from Multer
    const files = req.files as Express.Multer.File[];
    const filePaths = files?.map((file) => file.path) || [];

    // 2. Prepare the data (Handle partial updates)
    const updateData = {
      ...req.body,
      // Only parse if the value exists in the request body
      ...(req.body.price && { price: parseFloat(req.body.price) }),
      ...(req.body.stock && { stock: parseInt(req.body.stock, 10) }),

      // Handle categoryNames logic
      ...(req.body.categoryNames && {
        categoryNames: Array.isArray(req.body.categoryNames)
          ? req.body.categoryNames
          : [req.body.categoryNames],
      }),
    };

    // 3. Pass ID, data, and new images to service
    const updated = await ProductService.updateProduct(
      req.params.id,
      updateData,
      filePaths,
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
```

---

### 🛣️ 2. Update `product.routes.ts`

Just like the `POST` route, the `PATCH` route now needs the `upload` middleware to handle the incoming `multipart/form-data`.

```typescript
// Look for the patch route in src/routes/product.routes.ts
router.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  upload.array("images", 5), // Add this!
  validate(UpdateProductSchema),
  updateProduct,
);
```

---

### 📄 3. Sync the Swagger Docs

Update the `patch` block for `/api/products/{id}` in `src/config/swagger.ts` to use `multipart/form-data`.

```typescript
patch: {
  tags: ["Products"],
  security: [{ bearerAuth: [] }],
  summary: "Update an existing product (Admin only)",
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  requestBody: {
    content: {
      "multipart/form-data": { // Update content type
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
            categoryNames: {
              type: "array",
              items: { type: "string" }
            },
            images: {
              type: "array",
              items: { type: "string", format: "binary" }
            }
          }
        }
      }
    }
  },
  // ... responses
}
```

---

### 💡 A Note on the Service Layer

Make sure your `ProductService.updateProduct` in `src/services/product.service.ts` uses the `create` logic for images rather than trying to overwrite the whole relation, otherwise, you might lose previous images unless you specifically intend to clear them.

**Example Service Logic:**

```typescript
export const updateProduct = async (
  id: string,
  data: any,
  filePaths: string[] = [],
) => {
  const { categoryNames, ...productData } = data;

  return await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      images: {
        // This adds new images to the list.
        // If you want to delete old ones first, you'd add: deleteMany: {}
        create: filePaths.map((path) => ({ url: path })),
      },
      // ... category update logic
    },
    include: {
      categories: true,
      images: true,
    },
  });
};
```

Since you're on Arch, you might want to run a quick `ls public/uploads` after testing the update to make sure the new files are landing correctly. Ready to see if the Swagger UI behaves now?
