- feat(db): initialize schema with User and Product models
  - Configured Prisma with MariaDB (MySQL provider)
  - Added User model with Role enum (ADMIN/CUSTOMER)
  - Added Product model with Decimal precision for pricing
  - Applied initial migration and generated Prisma Client

Everything looks ready on the infrastructure side.
Seeing that **MariaDB 12.2.2** active and running on your Arch machine is a beautiful sight.

Since you've already verified you can log in via the terminal,
you're clear for takeoff.
One small thing you might want to do is create the database manually first,
or let Prisma handle it during the first migration.

### 1. Initialize Prisma

Run the following in your project root:

```bash
npx prisma init
```

This will create a `prisma` folder with a `schema.prisma` file and a `.env` file.

### 2. Configure the Connection

Open your `.env` (the one Prisma just made) and make sure it matches your MariaDB setup.

```bash
# Replace root and password with your actual credentials
DATABASE_URL="mysql://root:your_password@localhost:3306/ecommerce_db"
```

### 3. The `schema.prisma` (The Blueprint)

Now, open `prisma/schema.prisma`. We need to define the **User** and the **Product** to get the MVP started.

Notice we use `provider = "mysql"` for MariaDB. Also, I've added an `enum` for the Roles—this is a very clean way to handle Authorization later.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  ADMIN
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships will go here later (e.g., Cart, Orders)
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

### 💡 Why this schema is solid

- **`@unique` on Email:** Prevents two people from registering with the same address.
- **`Decimal` for Price:** **NEVER** use `Float` or `Number` for money. Floats have rounding errors (e.g., $0.1 + 0.2$ becomes $0.3000000004$). `Decimal` ensures accuracy for payments.
- **`@db.Text`:** Standard strings are usually limited to 255 characters. For a product description, you want `Text` so you can write long paragraphs.

### 🚀 Your Move

1. Paste that schema into your `prisma/schema.prisma`.
2. Run the migration to sync your MariaDB with this schema:

   ```bash
   npx prisma migrate dev --name init_users_and_products
   ```

3. Check your MariaDB again with `show databases;`—you should see `ecommerce_db` and your new tables!

**Did the migration run successfully, or did Prisma complain about the connection string?**
