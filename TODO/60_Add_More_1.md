To keep the quality high and the documentation "DRY" (Don't Repeat Yourself), we’ll expand the `components` to include **Auth** and **Cart** schemas. This makes the UI much cleaner and easier for a frontend dev (or future Nabil) to use.

Here is the complete, expanded `swagger.ts` logic. I've added the **Authorize** button configuration so you can test your protected routes directly in the browser.

### 🛠️ The Complete `src/config/swagger.ts`

```typescript
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "E-Commerce API",
    version: "1.0.0",
    description:
      "Documentation for the E-Commerce API built with Node.js, TypeScript, and Prisma.",
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
      // --- AUTH SCHEMAS ---
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string" },
              role: { type: "string" },
            },
          },
        },
      },
      // --- PRODUCT SCHEMAS ---
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
      // --- CART SCHEMAS ---
      CartItem: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid" },
          quantity: { type: "integer" },
          product: { $ref: "#/components/schemas/Product" },
        },
      },
      // --- ORDER SCHEMAS ---
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
            items: {
              type: "object",
              properties: {
                productId: { type: "string", format: "uuid" },
                quantity: { type: "integer" },
                price: { type: "number" },
                product: {
                  type: "object",
                  properties: { name: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    // AUTH ENDPOINTS
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string", example: "CUSTOMER" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "User registered" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login to get JWT token",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Successful login",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },
    // PRODUCT ENDPOINTS
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Get all products",
        responses: {
          200: {
            description: "List of products",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
      },
    },
    // CART ENDPOINTS
    "/api/cart": {
      get: {
        tags: ["Cart"],
        security: [{ bearerAuth: [] }],
        summary: "View current cart",
        responses: { 200: { description: "Current cart items" } },
      },
      post: {
        tags: ["Cart"],
        security: [{ bearerAuth: [] }],
        summary: "Add item to cart",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  productId: { type: "string", format: "uuid" },
                  quantity: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Item added" } },
      },
    },
    // ORDER ENDPOINTS
    "/api/orders/checkout": {
      post: {
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        summary: "Checkout cart and create order",
        responses: {
          201: {
            description: "Order created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
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

### 🚀 Verification Steps

1. **Authorization Test**: Open `/api-docs`, click the green **Authorize** button. Paste your JWT (get one from `/api/auth/login` first).
2. **Logic Test**: Try adding a product to the cart via the Swagger UI using the product's UUID.
3. **Checkout Test**: Run the checkout and see the response match the `Order` schema perfectly.

This covers the entire journey: Auth -> Products -> Cart -> Orders. Since you're using Arch/Neovim, this essentially replaces the need for a separate Postman collection. Everything lives in the code.

**Ready to commit this final documentation phase?**
