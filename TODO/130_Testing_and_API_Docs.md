Let's round out the **User Management** task by adding the integration test file and updating the Swagger configuration.

### 🧪 1. The Integration Test

Create a new test file at `tests/integration/users/user.test.ts`. This ensures your RBAC (Role-Based Access Control) is working and that pagination returns the expected structure.

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("User Management Integration (Admin)", () => {
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_user_mgmt@test.com");
    customerToken = await getCustomerToken("regular_user_mgmt@test.com");
  });

  it("should allow an ADMIN to fetch the users list with pagination", async () => {
    const res = await request(app)
      .get("/api/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body).toHaveProperty("pagination");
    expect(Array.isArray(res.body.users)).toBe(true);
    // Ensure sensitive data like password is NOT leaked
    if (res.body.users.length > 0) {
      expect(res.body.users[0]).not.toHaveProperty("password");
    }
  });

  it("should return 403 Forbidden when a CUSTOMER tries to access the list", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should return 401 Unauthorized if no token is provided", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(401);
  });
});
```

---

### 📖 2. Update Swagger Docs

Add the User management documentation to `src/config/swagger.ts`. We need to define the User schema and the `/api/users` path.

**Add to `components.schemas`:**

```typescript
User: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["ADMIN", "CUSTOMER"] },
    createdAt: { type: "string", format: "date-time" },
  },
},
```

**Add to `paths`:**

```typescript
"/api/users": {
  get: {
    tags: ["User Management"],
    security: [{ bearerAuth: [] }],
    summary: "Get all registered users (Admin only)",
    parameters: [
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
    ],
    responses: {
      200: {
        description: "List of users with pagination info",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                users: { type: "array", items: { $ref: "#/components/schemas/User" } },
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
```

---

### 📝 Final check before moving to Carts

- **Permissions:** You mentioned you're using Arch—make sure your `public/uploads` folder hasn't accumulated too many "orphan" files from previous failed tests.
- **Zod:** Since we're just fetching users, we didn't need a Zod schema for the `GET` request, but if we later add "Update User Role," we'll definitely add one.

How is the terminal looking? If the tests pass, are you ready to jump into the **Cart logic** or should we handle **Soft Deleting Users** first?
