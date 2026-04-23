Good morning! Since you already have the infrastructure for **Swagger UI** set up in `app.ts`, the "quality" way to handle this isn't just typing out long JSON objects in `swagger.ts`. That gets messy fast.

Instead, we should use **Components** and **Schemas**. This allows us to define a `Product` or an `Order` once and reuse it across multiple endpoints (like `GET /products` and `GET /orders`).

Let's update your `./src/config/swagger.ts` to include the **Security Schemes** (for your JWT token) and the **Models** we've built so far.

---

### 🛠️ The Optimized `swagger.ts`

```typescript
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "E-Commerce API",
    version: "1.0.0",
    description: "Backend API for the e-commerce roadmap challenge",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          stock: { type: "integer" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          totalAmount: { type: "number" },
          status: {
            type: "string",
            enum: ["PENDING", "COMPLETED", "CANCELLED"],
          },
          createdAt: { type: "string", format: "date-time" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid" },
          quantity: { type: "integer" },
          price: { type: "number" },
          product: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/orders/checkout": {
      post: {
        summary: "Checkout the current user's cart",
        security: [{ bearerAuth: [] }],
        tags: ["Orders"],
        responses: {
          201: {
            description: "Order created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          400: { description: "Empty cart or insufficient stock" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/orders": {
      get: {
        summary: "Get current user's order history",
        security: [{ bearerAuth: [] }],
        tags: ["Orders"],
        responses: {
          200: {
            description: "List of orders",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
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

### 🧐 Why this approach?

1. **Security Integration**: By adding `securitySchemes`, you'll see an **"Authorize"** button in the Swagger UI. You can paste your JWT token there once, and all subsequent "Try it out" requests will include the `Authorization` header automatically.
2. **Schema Referencing (`$ref`)**: Notice how `/api/orders` uses `items: { $ref: "#/components/schemas/Order" }`. If we change the Order structure later, we only change it in one place under `components`.
3. **UUID Accuracy**: Since you moved to UUIDs in Arch/Prisma, I updated the `type` to `string` with `format: uuid`.

### 🚀 Your Task

Update your `swagger.ts` with these paths and schemas. Once you restart your server and visit `http://localhost:3000/api-docs`, you should be able to:

1. Login via your Auth endpoint (if documented) to get a token.
2. Click **Authorize** in Swagger and paste the token.
3. Call **Checkout** directly from the browser to see the transaction work.

**Do you want to add the Auth and Cart endpoints to the documentation next, or should we refine these Order schemas first?**
