Everything is clear. You've provided the exact files we need to modify to transition to the **SUPER_ADMIN** hierarchy.

Since your goal is to have a "God-mode" admin who can manage other admins, while standard admins can only manage products/customers, let's go step-by-step through the migration and code updates.

---

### 🛠️ Step 1: Update Schema & Migrate

Open `./prisma/schema.prisma` and add `SUPER_ADMIN` to the enum.

```prisma
enum Role {
  CUSTOMER
  ADMIN
  SUPER_ADMIN // 👈 Add this
}
```

Then, run the migration in your terminal:

```bash
npx prisma migrate dev --name add_super_admin_role
```

---

### 🔑 Step 2: Update the Seeder

Update `./prisma/seed-first-admin.ts` to ensure your main account gets the top-tier role.

```typescript
// ... inside main()
const admin = await prisma.user.upsert({
  where: { email: "admin@ecommerce.com" },
  update: { role: "SUPER_ADMIN" }, // Update existing if it exists
  create: {
    email: "admin@ecommerce.com",
    password: adminPassword,
    role: "SUPER_ADMIN", // 👈 Set to SUPER_ADMIN
  },
});
```

_Run it with:_ `npx tsx prisma/seed-first-admin.ts`

---

### 🛡️ Step 3: Update Middleware logic

We want any route marked for `ADMIN` to automatically allow `SUPER_ADMIN` as well, so you don't have to write `authorize(["ADMIN", "SUPER_ADMIN"])` every single time.

Update `./src/middlewares/role.middleware.ts`:

```typescript
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ error: { message: "Unauthorized" } });

    const userRole = req.user.role;

    // 💡 Logic: SUPER_ADMIN bypasses all ADMIN checks
    const hasPermission =
      userRole === "SUPER_ADMIN" || roles.includes(userRole);

    if (!hasPermission) {
      return res.status(403).json({
        error: { message: "Forbidden: You do not have permission" },
      });
    }
    next();
  };
};
```

---

### 🎮 Step 4: Secure the Controller

Now, we enforce your new rule: **Only Super Admins can change roles.**

Update `changeUserRole` in `./src/controllers/user.controller.ts`:

```typescript
export const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🛡️ Rule check: Is the person MAKING the request a SUPER_ADMIN?
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        error: { message: "Only Super Admins can manage user roles." },
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Update valid roles check
    if (!["SUPER_ADMIN", "ADMIN", "CUSTOMER"].includes(role)) {
      return res
        .status(400)
        .json({ error: { message: "Invalid role provided" } });
    }

    const updatedUser = await UserService.updateUserRole(id, role);
    res.json({ message: `User role updated to ${role}`, user: updatedUser });
  } catch (error) {
    next(error);
  }
};
```

---

### 📋 Checkpoint

With these changes:

1. **Product/Order Routes:** If you have `authorize(["ADMIN"])`, both Admins and Super Admins can enter.
2. **Role Management:** Only the account from your seeder (or someone you promote to `SUPER_ADMIN`) can turn a Customer into an Admin.

Does your `src/services/user.service.ts` already handle the `SUPER_ADMIN` string in the `updateUserRole` function, or do we need to check the type definitions there?
