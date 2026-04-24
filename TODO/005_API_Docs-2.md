# 1. Install Dependencies

You’ll need the main library and the TypeScript types:

```bash
npm install swagger-ui-express
npm install --save-dev @types/swagger-ui-express
```

### 2. Create your OpenAPI Definition

To keep `app.ts` clean, let's create a dedicated file for your API documentation. This makes it much easier to manage as you add Users, Carts, and Payments.

**File:** `src/config/swagger.ts`

```typescript
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "E-Commerce API",
    version: "1.0.0",
    description: "Documentation for the roadmap.sh E-Commerce API challenge",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  paths: {
    "/api/products": {
      get: {
        summary: "Returns a list of all products",
        responses: {
          200: {
            description: "A JSON array of product objects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                      price: { type: "number" },
                      stock: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
```

---

### 3. Update `src/app.ts`

Now, we hook it into Express. This is much simpler than the Scalar setup and Neovim will be much happier with the types.

```typescript
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { getProducts } from "./controllers/product.controller.js";

const app = express();
app.use(express.json());

// Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.get("/api/products", getProducts);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📑 Docs:   http://localhost:${PORT}/api-docs`);
});
```

### Why this is better for now

- **Stability:** `swagger-ui-express` is extremely stable and won't give you those weird type errors you saw with Scalar.
- **Familiarity:** Most API developers know exactly how to use the Swagger "Try it out" button.
- **Standardization:** It uses the standard OpenAPI 3.0 format which is easy to export.

**Give this a shot!** Restart your server, head over to `http://localhost:3000/api-docs`, and you should see the classic green and blue Swagger interface.

Does Neovim look clean now with no red lines?
