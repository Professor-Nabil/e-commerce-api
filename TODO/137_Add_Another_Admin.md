That makes perfect sense. This is the final piece of the **User Management** puzzle. By allowing an Admin to promote other users, you're building a sustainable management flow for the platform.

Here is the implementation to allow role toggling.

### 🛠️ 1. The Service Layer (`src/services/user.service.ts`)

We'll add a specific function to handle the role update.

```typescript
export const updateUserRole = async (
  id: string,
  role: "ADMIN" | "CUSTOMER",
) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });
};
```

---

### 🎮 2. The Controller (`src/controllers/user.controller.ts`)

We need to handle the request and ensure we aren't passing invalid roles.

```typescript
export const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // Expecting { "role": "ADMIN" }

    if (!["ADMIN", "CUSTOMER"].includes(role)) {
      return res
        .status(400)
        .json({ error: { message: "Invalid role provided" } });
    }

    const updatedUser = await UserService.updateUserRole(id, role);
    res.json({
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
```

---

### 🛣️ 3. The Route (`src/routes/user.routes.ts`)

Add the new endpoint to your user routes file.

```typescript
router.patch("/:id/role", authenticate, authorize(["ADMIN"]), changeUserRole);
```

---

### 📖 4. Swagger Documentation (`src/config/swagger.ts`)

Add the path documentation so you can test it from the UI.

```typescript
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
        schema: { type: "string", format: "uuid" }
      }
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["role"],
            properties: {
              role: { type: "string", enum: ["ADMIN", "CUSTOMER"] }
            }
          }
        }
      }
    },
    responses: {
      200: { description: "Role updated successfully" },
      403: { description: "Forbidden - Admin only" }
    }
  }
}
```

---

### 🧪 5. Integration Test (`tests/integration/users/user.test.ts`)

Let's add a test to verify that a promoted user can suddenly access Admin-only routes.

```typescript
it("should allow an ADMIN to promote a CUSTOMER to ADMIN", async () => {
  // 1. Promote the customer
  const res = await request(app)
    .patch(`/api/users/${targetUserId}/role`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ role: "ADMIN" });

  expect(res.statusCode).toBe(200);
  expect(res.body.user.role).toBe("ADMIN");

  // 2. Verify the new Admin can now access the user list
  // Note: In a real app, the user might need to re-login to get a new token with the new role
  // depending on how your JWT is structured.
});
```

### 💡 A Technical Note for your Workflow

Since you're using **JWTs** that likely encode the `role` inside the payload, remember that a user who is promoted while logged in won't see their new powers until they log in again (generating a new token). In a more advanced version, you'd check the database role on every request, but for an MVP, a re-login is standard.

How does the implementation look on your end? Ready to verify it with a `curl` or should we jump straight into the **Cart** logic now?
