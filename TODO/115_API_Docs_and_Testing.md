That worked perfectly! Seeing the categories auto-populate in the `POST` response is a great feeling. Now, let’s wrap this up with proper coverage and documentation to keep the project in a professional state.

---

## 📖 1. API Documentation Update

We need to add the **Category** schema and the new endpoints to your Swagger config.

**Edit `./src/config/swagger.ts`**:

1. Add the `Category` schema to `components.schemas`.
2. Add the `/api/categories` paths.

```ts
// Inside components.schemas
Category: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
},

// Inside paths
"/api/categories": {
  get: {
    tags: ["Categories"],
    summary: "Get all categories",
    responses: {
      200: {
        description: "List of categories",
        content: {
          "application/json": {
            schema: { type: "array", items: { $ref: "#/components/schemas/Category" } }
          }
        }
      }
    }
  },
  post: {
    tags: ["Categories"],
    security: [{ bearerAuth: [] }],
    summary: "Create a new category (Admin only)",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name"],
            properties: { name: { type: "string" } }
          }
        }
      }
    },
    responses: {
      201: { description: "Category created" },
      403: { description: "Admin only" }
    }
  }
}
```

---

## 🧪 2. Integration Testing

Let's create a new test file: `tests/integration/products/categories.test.ts`. This will verify that the "Create or Connect" logic doesn't break over time.

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken } from "../../helpers/auth.helper.js";

describe("Category Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_cat@test.com");
  });

  it("should create new categories when creating a product", async () => {
    const productData = {
      name: "Mechanical Keyboard",
      description: "Clicky",
      price: 150,
      stock: 10,
      categoryNames: ["Hardware", "PC"],
    };

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(productData);

    expect(res.statusCode).toBe(201);
    expect(res.body.categories).toHaveLength(2);
    expect(res.body.categories.map((c: any) => c.name)).toContain("Hardware");
  });

  it("should list all categories", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // At least the 2 from the previous test should exist
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});
```

---

## 🛠️ 3. Quick Fix for Product Listing

Since we added `include: { categories: true }` to the service, ensure your `GET /api/products` Swagger documentation also reflects that products now come with their category objects attached.

---

### 🏁 Checkpoint

1. **Docs:** Visit `http://localhost:3000/api-docs` to see the new **Categories** section.
2. **Tests:** Run `npm test` to ensure the new integration test passes alongside your existing checkout tests.

**What do you think?** Should we move on to **Category Filtering** (allowing users to search for products _by_ category) or tackle the **Product Image** integration next?
