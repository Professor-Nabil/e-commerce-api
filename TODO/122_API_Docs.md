Updating the Swagger documentation is the final "visual" piece of this puzzle. By switching the `requestBody` from `application/json` to `multipart/form-data`, Swagger UI will automatically render a file picker for the `images` field.

### 🛠️ Step 1: Update `./src/config/swagger.ts`

Find the `post` block under `/api/products` and replace it with this version. I've also updated the `Product` schema to include the images array.

```ts
// 1. Update the Product Schema in components/schemas
Product: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    description: { type: "string" },
    price: { type: "number" },
    stock: { type: "integer" },
    images: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string" }
        }
      }
    }
  }
},

// 2. Update the /api/products POST path
"/api/products": {
  post: {
    tags: ["Products"],
    security: [{ bearerAuth: [] }],
    summary: "Create a new product with images (Admin only)",
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": { // Changed from application/json
          schema: {
            type: "object",
            required: ["name", "price", "stock"],
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              stock: { type: "integer" },
              categoryNames: {
                type: "array",
                items: { type: "string" },
                description: "Array of category names"
              },
              images: {
                type: "array",
                items: {
                  type: "string",
                  format: "binary" // This tells Swagger to show a file upload button
                }
              }
            }
          }
        }
      }
    },
    // ... responses remain the same
  }
}
```

---

### 🧪 Step 2: What about Testing?

**Yes, we absolutely need to edit your tests.** Since the `POST /api/products` logic has changed from receiving JSON to receiving Multipart data, your existing integration tests for product creation are likely failing now.

#### Why they are failing

Your tests probably look like this: `.send({ name: 'Keyboard', ... })`. But `multer` doesn't see data sent via `.send()`.

#### The Fix

You need to use `.field()` for text and `.attach()` for files in Vitest/Supertest.

**Example for your `./tests/product.test.ts`:**

```ts
it("should create a product with an image", async () => {
  const response = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${adminToken}`)
    .field("name", "Test Product") // Use .field for text
    .field("description", "A valid description for testing")
    .field("price", 99.99)
    .field("stock", 10)
    .attach("images", "tests/fixtures/test-image.png"); // Path to a small test image

  expect(response.status).toBe(201);
  expect(response.body.images).toHaveLength(1);
});
```

---

### 📋 To-Do

1. **Swagger:** Apply the `multipart/form-data` change to `swagger.ts`.
2. **Test Assets:** Create a directory `tests/fixtures/` and put a small `.png` file there named `test-image.png`.
3. **Update Tests:** Open your product integration test file and update the `createProduct` test case.

**Would you like me to provide a full updated test file for products, or do you want to try refactoring the existing one first?**
