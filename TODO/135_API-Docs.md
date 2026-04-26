Nice catch. Since we've added the status field and the ability to toggle it, we should update the **User Schema** first to include the `status` enum, and then add the `PATCH` path for the banning logic.

Update your `src/config/swagger.ts` with these blocks:

### 🛠️ 1. Update User Schema

Ensure your schema reflects the new `status` field so the Admin knows what values are valid.

```typescript
User: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["ADMIN", "CUSTOMER"] },
    status: { type: "string", enum: ["ACTIVE", "BANNED"] }, // 👈 Added this
    createdAt: { type: "string", format: "date-time" },
  },
},
```

---

### 🛣️ 2. Add the Toggle Status Path

Add this new endpoint under the `paths` object. It's clean to keep it grouped with other `/api/users` routes.

```typescript
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
                description: "The new status for the account"
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
                user: { $ref: "#/components/schemas/User" }
              }
            }
          }
        }
      },
      403: { description: "Forbidden - Admin access required" },
      404: { description: "User not found" },
    },
  },
},
```

---

### 📦 Session Wrap-up

That covers the **User Management** milestones for today! You've got:

1. The database field for `status`.
2. The service/controller logic to toggle it.
3. The auth check to block banned users.
4. Full integration tests.
5. Complete Swagger documentation.

Ready to commit this and call it a night?

```bash
git add .
git commit -m "docs: add user status toggle to swagger and update user schema"
```

The Arch terminal is looking pristine. Tomorrow we'll dive into the **Cart and Order** logistics. Enjoy the rest of your Sunday! 🚀
