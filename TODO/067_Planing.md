### 🧪 Updating Your Tests

Now that registration is locked to `CUSTOMER`, your existing tests for Admin features will fail if they rely on registering a new admin via the API.

To fix this in your test files (like `tests/checkout.test.ts` and `tests/orders.test.ts`), you have two "High Quality" options:

#### Option A: Use the Seeded Admin

Instead of registering a new admin in the `beforeAll` block, just use the credentials from your seed script (`admin@ecommerce.com` / `superadmin`).

#### Option B: Manual DB Insert (Cleaner for Isolation)

Directly insert the admin into the database using Prisma inside the test setup. This keeps your tests independent of the seed file.

**Example for `tests/checkout.test.ts`:**

```typescript
beforeAll(async () => {
  // Directly create an admin in the test database
  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin_test@test.com" },
    update: {},
    create: {
      email: "admin_test@test.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
});
```

---

### 📦 Summary of Changes for Commit

Since you've modified the core security flow, here is what your commit includes:

1. **Security Fix**: `auth.service.ts` now hardcodes `role: "CUSTOMER"` for all new registrations.
2. **Bootstrap Script**: Added `prisma/seed-first-admin.ts` to safely create the initial Super Admin.
3. **Docs Sync**: Updated Swagger to remove the `role` input from the registration endpoint.
4. **Test Stability**: Updated test setups to create Admin users via Prisma rather than the public API.

**Are you ready to run the tests and finalize the commit, or should we refine how the Admin "promotes" other users first?**
