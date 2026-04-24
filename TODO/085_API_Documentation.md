Good catch. Keeping documentation in sync is what separates a "side project" from a professional codebase. Since you've added **PATCH** and **DELETE** for products, we need to add those specific paths to your Swagger spec so your frontend friend knows how to call them.

Add these two methods under the `"/api/products/{id}"` block in your `./src/config/swagger.ts`:

### 📝 Updated Swagger Paths

```ts
    // ... inside "/api/products/{id}" block ...
    patch: {
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      summary: "Update an existing product (Admin only)",
      description: "Allows partial updates. Only provided fields will be updated.",
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
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                stock: { type: "integer" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Product updated successfully" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "Product not found" },
      },
    },
    delete: {
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      summary: "Soft delete a product (Admin only)",
      description: "Marks a product as deleted without removing it from the database.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        204: { description: "Product archived successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "Product not found" },
      },
    },
```
