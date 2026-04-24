You're right, we can't leave the Admin's product management out of the docs. This is a critical part of the API's RBAC (Role-Based Access Control) structure.

I've added the **`GET /api/products/{id}`** and the **`POST /api/products`** endpoints. Notice that for the POST route, I've explicitly noted the **Security** requirement so Swagger knows to prompt for the Admin's Bearer token.

### 🛠️ Updated `./src/config/swagger.ts` (Product Section)

Add these to your `paths` object:

```typescript
    // ... other paths ...
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Get all products",
        responses: {
          200: {
            description: "List of products",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } } },
          },
        },
      },
      post: {
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        summary: "Create a new product (Admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "price", "stock"],
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
          201: {
            description: "Product created successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } },
          },
          401: { description: "Unauthorized - Missing Token" },
          403: { description: "Forbidden - Requires ADMIN role" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The UUID of the product",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Product found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } },
          },
          404: { description: "Product not found" },
        },
      },
    },
```

---

### 💾 Final Commit Checklist

Since this is our "Quality" session, let's verify:

- **Security Definitions**: Swagger now knows about `bearerAuth`.
- **Schema Reuse**: We are using `$ref` for `Product` in both the list and the individual fetch.
- **Admin Routes**: The POST route correctly specifies that it is an Admin-only action.

> **Commit Message:**

**Everything looks perfect, Nabil.** Since your tests are already green, this documentation is the "seal of quality" on your MVP.

**Whenever you're ready, hit that commit!** Have a great rest of your day.
