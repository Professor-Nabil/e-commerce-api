Since your existing test already captures the `targetUserId` and verifies the "Ban" logic, we just need to add the "Promotion" test case to the end.

A key technical detail: when you promote a user in the database, their **existing** `customerToken` (which you generated in `beforeAll`) still contains `role: "CUSTOMER"` in its payload. To verify they "suddenly" have access, they must **re-login** to get a fresh token with the `ADMIN` role.

### 🧪 Updated `tests/integration/users/user.test.ts`

Add this test case at the end of your `describe` block:

```ts
it("should allow an ADMIN to promote a CUSTOMER and the new ADMIN can then access admin routes", async () => {
  // 1. Unban the user first (since the previous test banned them)
  await request(app)
    .patch(`/api/users/${targetUserId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "ACTIVE" });

  // 2. Admin promotes the Customer to ADMIN
  const promoRes = await request(app)
    .patch(`/api/users/${targetUserId}/role`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ role: "ADMIN" });

  expect(promoRes.statusCode).toBe(200);
  expect(promoRes.body.user.role).toBe("ADMIN");

  // 3. The user MUST re-login to get a new JWT with the ADMIN role
  const loginRes = await request(app).post("/api/auth/login").send({
    email: "regular_user_mgmt@test.com",
    password: "password123",
  });

  const newAdminToken = loginRes.body.token;

  // 4. Verify the new token now allows access to the user list (Admin only)
  const accessRes = await request(app)
    .get("/api/users")
    .set("Authorization", `Bearer ${newAdminToken}`);

  expect(accessRes.statusCode).toBe(200);
});
```

---

### ⚠️ A Note on Test Order

Because your tests share the same `targetUserId`, the order matters:

1. **Fetch ID** (Works)
2. **403 Check** (Works)
3. **Ban Check** (User is now BANNED in the DB)
4. **Promotion Check** (We must set status back to **ACTIVE** or the login in step 3 will fail with a 403 before it even checks the role).

### 🚀 Summary of Changes

- **Service:** Added `updateUserRole`.
- **Controller:** Added `changeUserRole`.
- **Routes:** Added `PATCH /api/users/:id/role`.
- **Swagger:** Added documentation for the new endpoint.
- **Test:** Added the promotion/re-login verification flow.

Does this flow make sense? If you're happy with how the promotion logic works, we can finally mark "User Management" as **Done** in your `PLAN.md` and move on to the **Cart** system tomorrow!
