# API Documentation

### 1. Swagger (OpenAPI) - The Gold Standard

This is the most common tool. It generates a "Live" documentation page (usually at `/api-docs`) where people can actually click "Try it out" and run your API from the browser.

- **How it works:** You add comments to your code, or create a `swagger.json` file.
- **Pro:** It's interactive.
- **Con:** It takes a bit of setup.

### 2. Scalar / Redoc - The "Modern" Look

These are beautiful, clean alternatives to Swagger. They use the same OpenAPI file but make the UI look like high-end documentation (similar to Stripe’s docs).

---

### 🚀 My Recommendation: `scalar`

Since you're on the bleeding edge with Node 25 and MariaDB 12, let's use something modern. **Scalar** is incredibly easy to integrate with Express and looks amazing.

#### Step 1: Install the documentation tools

```bash
npm install @scalar/express-api-reference
```

#### Step 2: Setup the "Public" Product Route

Let's build the `GET /api/products` logic so we have something to document.

**1. Create the Service (`src/services/product.service.ts`)**
This is where the "Brain" lives. It talks to Prisma.

```typescript
import { prisma } from "../config/prisma.js";

export const getAllProducts = async () => {
  return await prisma.product.findMany();
};
```

**2. Create the Controller (`src/controllers/product.controller.ts`)**
This handles the HTTP request and response.

```typescript
import { Request, Response } from "express";
import * as ProductService from "../services/product.service.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
```

**3. Create the Route and Documentation (`src/app.ts`)**
This is how the outside world finds your logic.

```typescript
import express from "express";
import { apiReference } from "@scalar/express-api-reference";
import { getProducts } from "./controllers/product.controller.js";

const app = express();
app.use(express.json());

// 1. The Route
app.get("/api/products", getProducts);

// 2. The Documentation (Simplified for now)
app.use(
  "/reference",
  apiReference({
    spec: {
      openapi: "3.1.0",
      info: {
        title: "E-Commerce API",
        version: "1.0.0",
      },
      paths: {
        "/api/products": {
          get: {
            summary: "Get all products",
            responses: {
              "200": { description: "A list of products" },
            },
          },
        },
      },
    },
  }),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 Docs available at http://localhost:${PORT}/reference`);
});
```

### Why this is great

- **Scannability:** Anyone joining your project can just go to `/reference` to see what's available.
- **Separation:** Your logic is in the Service, your HTTP handling is in the Controller, and your Documentation is visible.

**Do you want to try setting up this structure and see if you can see the "Docs" page in your browser?** (Once this works, we'll add a "Seed" script to put some fake products in your MariaDB so the list isn't empty!)
