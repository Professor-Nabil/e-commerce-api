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
        description: "Registers a new user with the default role of CUSTOMER.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "password123",
                  },
                  // role is REMOVED from here because it's handled internally by the service
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully as CUSTOMER" },
          400: { description: "Email already exists or invalid input" },
        },
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
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
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
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          404: { description: "Product not found" },
        },
      },
      // ... inside "/api/products/{id}" block ...
      patch: {
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        summary: "Update an existing product (Admin only)",
        description:
          "Allows partial updates. Only provided fields will be updated.",
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
        description:
          "Marks a product as deleted without removing it from the database.",
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
      delete: {
        tags: ["Cart"],
        security: [{ bearerAuth: [] }],
        summary: "Clear all items from the cart",
        responses: {
          204: { description: "Cart cleared successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/cart/{productId}": {
      patch: {
        tags: ["Cart"],
        security: [{ bearerAuth: [] }],
        summary: "Update quantity of a specific item in the cart",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: {
                  quantity: { type: "integer", minimum: 1, example: 5 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Quantity updated" },
          400: { description: "Validation error" },
          404: { description: "Item not found in cart" },
        },
      },
      delete: {
        tags: ["Cart"],
        security: [{ bearerAuth: [] }],
        summary: "Remove a specific item from the cart",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: { description: "Item removed successfully" },
          404: { description: "Item not found in cart" },
        },
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
    // ... inside paths ...
    "/api/orders": {
      get: {
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        summary: "Get current user's order history",
        description:
          "Returns all orders placed by the authenticated user, including items and product names.",
        responses: {
          200: {
            description: "A list of past orders",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
          401: { description: "Unauthorized - Valid JWT required" },
        },
      },
    },
    // ADMIN ORDER ENDPOINTS
    "/api/orders/admin": {
      get: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Get all user orders (Admin only)",
        responses: {
          200: {
            description: "List of all orders in the system",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
          403: { description: "Forbidden - Admin role required" },
        },
      },
    },
    "/api/orders/{id}/status": {
      patch: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Update order status (Admin only)",
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
                  status: {
                    type: "string",
                    enum: [
                      "PENDING",
                      "COMPLETED",
                      "SHIPPED",
                      "DELIVERED",
                      "CANCELLED",
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Status updated successfully" },
          400: { description: "Invalid status provided" },
          404: { description: "Order not found" },
        },
      },
    },
  },
};
