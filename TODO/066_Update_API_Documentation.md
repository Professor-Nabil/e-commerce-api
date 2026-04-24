This is a major step toward a professional architecture. By moving the "Admin" creation to a seed script and locking the registration route, you've essentially moved from a "demo" security model to a "production" one.

We need to update your Swagger documentation to reflect that the `role` property is no longer a part of the registration request.

### 🛠️ Updating `src/config/swagger.ts`

In the `/api/auth/register` path, remove the `role` property from the `requestBody`. This prevents the documentation from suggesting to users that they can choose their own role.

```typescript
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
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", format: "password", example: "password123" },
                  // role is REMOVED from here because it's handled internally by the service
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully as CUSTOMER" },
          400: { description: "Email already exists or invalid input" }
        },
      },
    },
```

---
