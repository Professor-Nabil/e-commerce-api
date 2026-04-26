To wrap up today's session, we’ll implement a "safety lock" to ensure that the last `SUPER_ADMIN` cannot demote themselves or be banned. This prevents you from accidentally locking yourself out of the system and needing to manually poke the database via the terminal.

We should apply this logic in the **Service Layer** to ensure it's enforced regardless of which controller calls it.

---

### 🛡️ 1. Update the Service Layer (`src/services/user.service.ts`)

We will add a private-style helper function to check the count of Super Admins before allowing any "destructive" role or status changes.

```typescript
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";

// ... (getAllUsers remains the same)

export const updateUserStatus = async (
  id: string,
  status: "ACTIVE" | "BANNED",
) => {
  // 🛡️ Safety Check: Prevent banning the last SUPER_ADMIN
  if (status === "BANNED") {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN", status: "ACTIVE" },
      });
      if (superAdminCount <= 1) {
        throw new AppError(
          "Operation denied: Cannot ban the only active Super Admin.",
          400,
        );
      }
    }
  }

  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, email: true, status: true },
  });
};

export const updateUserRole = async (
  id: string,
  role: "ADMIN" | "CUSTOMER" | "SUPER_ADMIN",
) => {
  // 🛡️ Safety Check: Prevent demoting the last SUPER_ADMIN
  const targetUser = await prisma.user.findUnique({ where: { id } });

  if (targetUser?.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });

    if (superAdminCount <= 1) {
      throw new AppError(
        "Operation denied: At least one Super Admin must exist.",
        400,
      );
    }
  }

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

### 🧪 2. Add a Protection Test (`tests/integration/users/user.test.ts`)

It's vital to test that this protection actually works. Since your `seed-first-admin.ts` creates one Super Admin, trying to demote them should fail.

```typescript
it("should NOT allow demoting the last SUPER_ADMIN", async () => {
  // 1. Find the Super Admin created by the seeder or helper
  const superAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  // 2. Try to demote them to CUSTOMER
  const res = await request(app)
    .patch(`/api/users/${superAdmin?.id}/role`)
    .set("Authorization", `Bearer ${superAdminToken}`)
    .send({ role: "CUSTOMER" });

  expect(res.statusCode).toBe(400);
  expect(res.body.error.message).toMatch(
    /At least one Super Admin must exist/i,
  );
});
```

---

### 📦 Wrap-up for Today

You've built a robust User Management system today:

- **Pagination & Search** for user listings.
- **Three-tier RBAC**: Customer, Admin, and Super Admin.
- **Account Controls**: Ban/Unban logic.
- **Promotion System**: Standard Admins handle users, Super Admins handle roles.
- **Fail-safes**: Preventing "Admin Extinction."

Final commit for the day:

```bash
git add .
git commit -m "feat: implement safety checks to prevent demoting or banning the last super admin"
```

The system is now secure and ready for the **Cart and Orders** logic in our next session. Great work today, Nabil! Ready to close the terminal and call it a night?
