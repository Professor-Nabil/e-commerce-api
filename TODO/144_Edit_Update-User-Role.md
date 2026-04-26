No worries, Nabil! I totally get it now. You want the `SUPER_ADMIN` to have the power to "replicate"—meaning they can promote someone else to the `SUPER_ADMIN` level as well.

To fix this, we need to update the type definitions and the validation logic in three places: the **Service**, the **Controller**, and the **Swagger** docs.

### 🛠️ 1. Update the Service (`src/services/user.service.ts`)

We need to allow the `role` parameter to accept `"SUPER_ADMIN"`.

```typescript
export const updateUserRole = async (
  id: string,
  role: "ADMIN" | "CUSTOMER" | "SUPER_ADMIN", // 👈 Added SUPER_ADMIN here
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

### 🎮 2. Update the Controller (`src/controllers/user.controller.ts`)

We need to adjust the array check to include the new role.

```typescript
export const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        error: { message: "Only Super Admins can manage user roles." },
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    // 🛡️ Updated validation list
    if (!["SUPER_ADMIN", "ADMIN", "CUSTOMER"].includes(role)) {
      return res
        .status(400)
        .json({ error: { message: "Invalid role provided" } });
    }

    const updatedUser = await UserService.updateUserRole(id, role as any);
    res.json({ message: `User role updated to ${role}`, user: updatedUser });
  } catch (error) {
    next(error);
  }
};
```

---

### 📖 3. Update Swagger (`src/config/swagger.ts`)

Make sure the documentation matches the new reality so the UI shows the correct options.

```typescript
// Inside the /api/users/{id}/role path definition
requestBody: {
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          role: {
            type: "string",
            enum: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] // 👈 Update this enum
          },
        },
      },
    },
  },
},
```

---

### 🧪 4. Quick Test Update

In your `tests/integration/users/user.test.ts`, you can now add a specific case for this:

```typescript
it("should allow a SUPER_ADMIN to create another SUPER_ADMIN", async () => {
  const res = await request(app)
    .patch(`/api/users/${targetUserId}/role`)
    .set("Authorization", `Bearer ${superAdminToken}`)
    .send({ role: "SUPER_ADMIN" });

  expect(res.statusCode).toBe(200);
  expect(res.body.user.role).toBe("SUPER_ADMIN");
});
```

### 🧠 One small tip for your Arch workflow

Since you're using TypeScript, if `updateUserRole` still complains about the string type, you might need to cast the role in the controller using `role as "ADMIN" | "CUSTOMER" | "SUPER_ADMIN"`.

Does this complete the "God-mode" powers you wanted for your Super Admin? If so, you're ready to commit!

```bash
git add .
git commit -m "feat: allow super_admin to promote users to super_admin role"
```
