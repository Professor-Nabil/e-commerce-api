This is a great move for data integrity. By creating the profile during registration, we ensure that every `User` record always has a corresponding `Profile` record, preventing those annoying "null pointer" errors when a user tries to view their settings for the first time.

Since you've already updated the schema to include the `Profile` model with a `userId` relation, we just need to use Prisma's **nested writes**.

---

### 🛠️ Update `src/services/auth.service.ts`

Modify the `registerUser` function to include the `profile` creation. Since the `Profile` fields are optional in your schema, we can just pass an empty object `{}`.

```typescript
export const registerUser = async (userData: any) => {
  // 1. Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // 2. Save to MariaDB with a nested Profile creation
  return await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      role: "CUSTOMER",
      // 🛡️ Create the empty profile linked to this user automatically
      profile: {
        create: {},
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      // We can also return the empty profile object if we want
      profile: true,
    },
  });
};
```

---

### 🔍 Why nested `create`?

Using `profile: { create: {} }` inside the `user.create` call is an **atomic operation**. This means:

- **All or nothing:** If the profile creation fails for some reason (unlikely here), the user won't be created either. Your database stays clean.
- **ID Mapping:** Prisma handles the `userId` foreign key assignment automatically. You don't have to wait for the user to be created, get the ID, and then make a second call.

### 🧪 Verifying with a Test

Since you are a "Tester" (as seen in your path name!), you'll want to verify this. Your existing registration integration tests should still pass, but now the response body will include a `profile` object.

You can add a quick check in your registration test:

```typescript
expect(res.body).toHaveProperty("profile");
expect(res.body.profile.firstName).toBeNull(); // Should be null initially
```

### 📦 Next Step

Now that every user is born with a profile, do you want to build the **Profile Controller** so they can actually fill in that `firstName`, `lastName`, and `shippingAddress`?
