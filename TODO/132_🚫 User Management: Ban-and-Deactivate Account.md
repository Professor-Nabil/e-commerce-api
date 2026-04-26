# 🚫 User Management: Ban/Deactivate Account

For an e-commerce platform, "Banning" is usually better than deleting. It preserves the order history for your financial records while preventing the user from logging in or placing new orders.

### 🛠️ 1. Update the Schema

We need a way to track if a user is active. Add a `status` field or an `isBanned` boolean to your `prisma/schema.prisma`.

```prisma
enum UserStatus {
  ACTIVE
  BANNED
}

model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String
  role      Role       @default(CUSTOMER)
  status    UserStatus @default(ACTIVE) // 👈 New field
  createdAt DateTime   @default(now())
  // ... rest of the model
}
```

_Don't forget to run:_ `npx prisma migrate dev --name add_user_status`

---

### 🛡️ 2. The Service Layer (`src/services/user.service.ts`)

We’ll create a function to toggle the status.

```typescript
export const updateUserStatus = async (
  id: string,
  status: "ACTIVE" | "BANNED",
) => {
  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, email: true, status: true },
  });
};
```

---

### 🎮 3. The Controller (`src/controllers/user.controller.ts`)

```typescript
export const toggleUserBan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting { "status": "BANNED" }

    const updatedUser = await UserService.updateUserStatus(id, status);
    res.json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
```

---

### 🔐 4. Critical: Update the Login Logic

Banning a user does nothing if they can still log in! You must update `src/services/auth.service.ts` to check the status during the login flow.

```typescript
// Inside your login/verify logic
if (user.status === "BANNED") {
  throw new AppError(
    "Your account has been deactivated. Please contact support.",
    403,
  );
}
```

---

### 🛣️ 5. The Route (`src/routes/user.routes.ts`)

```typescript
router.patch("/:id/status", authenticate, authorize(["ADMIN"]), toggleUserBan);
```

---

### 🧪 6. The "Banned" Test

Add this to your `tests/integration/users/user.test.ts`:

```typescript
it("should prevent a BANNED user from logging in", async () => {
  // 1. Admin bans the user
  await request(app)
    .patch(`/api/users/${testUserId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "BANNED" });

  // 2. User tries to login
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "testuser@example.com", password: "password123" });

  expect(loginRes.statusCode).toBe(403);
  expect(loginRes.body.error.message).toContain("deactivated");
});
```

Does this "Soft Ban" approach fit your vision, or were you thinking of a permanent "Delete" button?
