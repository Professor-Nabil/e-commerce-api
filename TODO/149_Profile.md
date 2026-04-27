Smart move. Keeping the `User` model lean for authentication and moving the "noisy" metadata to a `Profile` model is a classic architectural win. It follows the **Separation of Concerns** principle: `User` handles _identity_, while `Profile` handles _persona_.

Here is how we adjust the schema.

### 🛠️ 1. Update `prisma/schema.prisma`

We’ll define the `Profile` model and create a **One-to-One** relationship with `User`. I've added `onDelete: Cascade` so that if a user is deleted, their profile is wiped automatically.

```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String
  role      Role       @default(CUSTOMER)
  status    UserStatus @default(ACTIVE)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // Relationships
  profile   Profile?   // 👈 One-to-one link
  cart      Cart?
  orders    Order[]
}

model Profile {
  id              String   @id @default(uuid())
  firstName       String?
  lastName        String?
  phone           String?
  shippingAddress String?  @db.Text

  // Link back to User
  userId          String   @unique // 👈 Unique constraint for 1-to-1
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  updatedAt       DateTime @updatedAt
}
```

---

### 💻 2. Migration & Seeding Note

Run the migration in your Arch terminal:

```bash
npx prisma migrate dev --name create_profile_model
```

**⚠️ Important Logic Change:** Since we now have a separate table, when a user registers, we have two choices:

1. Create an empty profile automatically during registration (recommended for consistency).
2. Create it only when they first save their settings (leads to "Profile not found" errors if not handled).

I recommend updating your **Registration Service** to include a `profile: { create: {} }` block so every user has a record ready to go.

---

### 🎮 3. Controller Strategy: `me` vs `profile`

In modern APIs, developers often use a `/api/users/me` endpoint that returns the User _and_ the Profile in one shot using Prisma’s `include`.

**Prisma Query Preview:**

```typescript
const user = await prisma.user.findUnique({
  where: { id: req.user.id },
  include: { profile: true }, // 👈 Joins the tables
});
```

### 🛣️ 4. What's Next?

Now that the schema is decoupled, do you want to:

1. **Update the Auth Service** to create the profile during registration?
2. **Build the Profile Controller** to allow users to update these new fields?

Since we're wrapping up soon, we could quickly wire up the `PATCH /profile` logic. What do you think?
