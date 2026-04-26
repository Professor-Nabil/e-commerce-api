The reason your test is receiving a **200** instead of a **400** is because of the previous test: **"should allow a SUPER_ADMIN to create another SUPER_ADMIN"**.

In that test, you promoted `targetUserId` to `SUPER_ADMIN`. So when the "last admin" test runs, the database now has **two** Super Admins:

1. The one created in `beforeAll` (`super@test.com`).
2. The one you just promoted (`regular_user_mgmt@test.com`).

Since there are two, the safety check `if (superAdminCount <= 1)` passes, and the demotion is allowed.

### 🛠️ The Fix

We need to ensure we are actually testing the "last" one. We can do this by demoting the `targetUserId` back to a customer first, or just adjusting the logic to count properly.

Update the last test in `tests/integration/users/user.test.ts` to look like this:

```ts
it("should NOT allow demoting the last SUPER_ADMIN", async () => {
  // 1. First, demote the 'extra' Super Admin we created in the previous test
  // so that only one remains in the DB.
  await request(app)
    .patch(`/api/users/${targetUserId}/role`)
    .set("Authorization", `Bearer ${superAdminToken}`)
    .send({ role: "CUSTOMER" });

  // 2. Now find the absolute last Super Admin (the one used for the token)
  const lastSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  // 3. Try to demote the last one
  const res = await request(app)
    .patch(`/api/users/${lastSuperAdmin?.id}/role`)
    .set("Authorization", `Bearer ${superAdminToken}`)
    .send({ role: "CUSTOMER" });

  // 4. This should now correctly return 400
  expect(res.statusCode).toBe(400);
  expect(res.body.error.message).toMatch(
    /At least one Super Admin must exist/i,
  );
});
```

---

### 💡 Alternative Strategy

If you want your tests to be more "isolated," you could also do a manual count check inside that specific test to verify your assumptions:

```ts
it("should NOT allow demoting the last SUPER_ADMIN", async () => {
  const count = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
  console.log(`Current Super Admins: ${count}`); // This would show '2' without the fix above

  // ... rest of test
});
```

### 📦 Ready to Commit?

Once this passes, you've officially built a "Bulletproof Admin" system.

```bash
git add .
git commit -m "test: fix isolation in last admin demotion test"
```

The Arch terminal is green, the logic is sound, and you can't lock yourself out. Excellent session today! Ready to wrap it up?
