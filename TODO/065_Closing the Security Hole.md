Exactly. In a production-grade system, **trust must start from the inside.** If you leave a "Prove I'm an Admin" field in a public registration form, you are essentially leaving a key in the lock and hoping nobody turns it.

### 🏗️ The "Chain of Trust" Model

In professional software, this is usually handled through a **Delegated Authority** model:

1. **The "Genesis" (Super Admin):** The very first admin is created via a database seed or a manual terminal command. This person has "God Mode."
2. **The Promotion Flow:**
   - A new employee registers as a normal `USER`.
   - They send their email to the Super Admin.
   - The Super Admin logs into a protected dashboard and hits a button: `Promote to Admin`.
   - The API verifies the Super Admin's token and then updates the new employee's role in the database.
3. **The Hierarchy:** You can even have logic where `ADMIN` users can manage products, but only the `SUPER_ADMIN` can delete other admins.

---

### 🛠️ Closing the Security Hole

To bring your project up to "Real World" quality, let's fix the registration logic so it's impossible to "hack" into an admin account.

#### 1. Update the Service

Force the role to `CUSTOMER` so the database ignores any `role` sent in the request body.

```typescript
// src/services/auth.service.ts
export const register = async (userData: RegisterDTO) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      role: "CUSTOMER", // 👈 This overrides anything the user tries to send
    },
  });
};
```

#### 2. Create the "First Admin" (Prisma Seed)

Since you're on Arch and love the terminal, this is the most "pro" way to handle it. Create a file called `prisma/seed.ts`.

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("superadmin", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommerce.com" },
    update: {},
    create: {
      email: "admin@ecommerce.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Created Super Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// NOTE: To run this, you just use
// $ npx tsx prisma/seed.ts
```

---

### 📊 Updated Big Picture (Security Edition)

Now your checklist has a new "Quality" section:

- [x] **Secure Registration**: Hardcoded `CUSTOMER` role.
- [ ] **Admin Seeding**: Manual script to create the first admin.
- [ ] **Admin Promotion**: `PATCH /api/users/:id/role` (Protected endpoint for Admins only).

**Does this "Chain of Trust" concept make sense for your MVP?** If so, we can spend the last bit of our session setting up that `seed.ts` so you can stop registering admins through the public API.

<FollowUp label="Implement the Seed script?" query="Show me how to configure package.json and prisma/seed.ts to automate admin creation." />
