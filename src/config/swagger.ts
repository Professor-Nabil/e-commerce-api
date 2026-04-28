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
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string" },
              },
            },
          },
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
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["ADMIN", "CUSTOMER"] },
          status: { type: "string", enum: ["ACTIVE", "BANNED"] },
          createdAt: { type: "string", format: "date-time" },
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
    // Inside paths object in src/config/swagger.ts
    "/api/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request a password reset token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Reset link generated (check console)" },
          404: { description: "Email not found" },
        },
      },
    },
    "/api/auth/reset-password/{token}": {
      post: {
        tags: ["Authentication"],
        summary: "Reset password using token",
        parameters: [
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password updated successfully" },
          400: { description: "Invalid or expired token" },
        },
      },
    },
    // Inside paths object
    "/api/users/me/profile": {
      get: {
        tags: ["Profile"],
        security: [{ bearerAuth: [] }],
        summary: "Get current user's profile",
        responses: {
          200: { description: "Profile retrieved successfully" },
          401: { description: "Unauthorized" },
        },
      },
      patch: {
        tags: ["Profile"],
        security: [{ bearerAuth: [] }],
        summary: "Update current user's profile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  phone: { type: "string" },
                  shippingAddress: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Profile updated successfully" },
          400: { description: "Validation error" },
        },
      },
    },
    // PRODUCT ENDPOINTS
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List all products (Paginated)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Keyword search for product name or description",
          },
          {
            name: "categoryId",
            in: "query",
            schema: { type: "string" },
            description: "Filter products by Category UUID",
          },
          {
            name: "minPrice",
            in: "query",
            schema: { type: "number" },
            description: "Filter products with price greater than or equal to",
          },
          {
            name: "maxPrice",
            in: "query",
            schema: { type: "number" },
            description: "Filter products with price less than or equal to",
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["newest", "oldest", "price_asc", "price_desc"],
              default: "newest",
            },
            description: "Sort order for products",
          },
        ],
        responses: {
          200: {
            description: "Paginated products",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    products: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        page: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        summary: "Create a new product with images (Admin only)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              // Changed from application/json
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
                    description: "Array of category names",
                  },
                  images: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "binary", // This tells Swagger to show a file upload button
                    },
                  },
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
            "multipart/form-data": {
              // Update content type
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  stock: { type: "integer" },
                  categoryNames: {
                    type: "array",
                    items: { type: "string" },
                  },
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
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
    "/api/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get specific order details",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Order UUID",
          },
        ],
        responses: {
          200: {
            description: "Details of the order",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    totalAmount: { type: "number" },
                    status: { type: "string" },
                    createdAt: { type: "string" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          price: { type: "number" },
                          quantity: { type: "integer" },
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
          },
          403: { description: "Forbidden - Not your order" },
          404: { description: "Order not found" },
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
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get all categories",
        responses: {
          200: {
            description: "List of categories",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
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
                properties: { name: { type: "string" } },
              },
            },
          },
        },
        responses: {
          201: { description: "Category created" },
          403: { description: "Admin only" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["User Management"],
        security: [{ bearerAuth: [] }],
        summary: "Get all registered users (Admin only)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "List of users with pagination info",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        page: { type: "integer" },
                        pages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { description: "Forbidden - Admin access required" },
        },
      },
    },
    "/api/users/{id}/status": {
      patch: {
        tags: ["User Management"],
        security: [{ bearerAuth: [] }],
        summary: "Ban or Deactivate a user account (Admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "The ID of the user to update",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["ACTIVE", "BANNED"],
                    description: "The new status for the account",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          403: { description: "Forbidden - Admin access required" },
          404: { description: "User not found" },
        },
      },
    },
    "/api/users/{id}/role": {
      patch: {
        tags: ["User Management"],
        security: [{ bearerAuth: [] }],
        summary: "Change user role (Admin only)",
        description: "Promote a user to ADMIN or demote to CUSTOMER.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        // Inside the /api/users/{id}/role path definition
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    enum: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Role updated successfully" },
          403: { description: "Forbidden - Admin only" },
        },
      },
    },
  },
};
