Time to level up the architecture. By switching to **UUIDs**, we make the IDs unguessable, and by adding the **Cart** models, we establish the core logic of an e-commerce platform.

### 1. The New `schema.prisma`

We're moving from `Int` to `String` for IDs and using `@default(uuid())`. We're also adding a **One-to-One** relationship for the User/Cart and a **One-to-Many** for Cart/Items.

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
  id        String   @id @default(uuid()) // Unguessable ID
  email     String   @unique
  password  String
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // A user has one cart
  cart      Cart?
}

model Product {
  id          String   @id @default(uuid()) // Unguessable ID
  name        String
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // A product can be in many cart items
  cartItems   CartItem[]
}

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique // One cart per user
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Ensure a user can't have the same product twice in a cart (just increment quantity instead)
  @@unique([cartId, productId])
}
```

---

### ⚠️ Critical Migration Steps

Since you are changing the Primary Key types from `Int` to `String`, a simple migration might struggle if there is existing data. Since we are in the **MVP/Development** phase, it's best to reset:

1. **Update the Schema file.**
2. **Run the migration (this will wipe existing local data):**

   ```bash
   npx prisma migrate reset
   npx prisma migrate dev --name init_uuids_and_cart
   ```

3. **Generate Types:**

   ```bash
   npx prisma generate
   ```

---

### 2. Update your `seed.ts`

Because the IDs are now UUIDs (Strings), we don't need to change much in the seed, but it’s good to make sure it still works.

```typescript
// No changes needed to the data part, Prisma handles the UUID generation automatically!
// Just run it again after the migration:
// npx tsx prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Mechanical Keyboard",
        description: "Blue switches, RGB",
        price: 89.99,
        stock: 50,
      },
      {
        name: "Gaming Mouse",
        description: "16000 DPI, wireless",
        price: 45.5,
        stock: 120,
      },
      {
        name: "UltraWide Monitor",
        description: "34 inch, 144Hz",
        price: 450.0,
        stock: 15,
      },
    ],
  });
}

main()
  .then(() => console.log("✅ Database Seeded!"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

/*
npx tsx prisma/seed.ts
🚀 Verification
Run npm run dev.
Open http://localhost:3000/reference in your browser.
Try hitting the GET /api/products button in the UI or use curl localhost:3000/api/products.
How does the Scalar UI look? It's a lot cleaner than just a raw JSON response, right?
 */
```

---

### 3. Fixing the Code (Refactoring)

Because we changed `id` from `number` to `string`, you will see red errors in your LSP (Neovim). Here is how to fix them:

**In `src/controllers/product.controller.ts`:**
Remove the `Number()` conversion since IDs are now strings.

```typescript
// Before
const product = await ProductService.getProductById(Number(id));

// After
const product = await ProductService.getProductById(id);
```

**In `src/services/product.service.ts`:**

```typescript
// Update the type to string
export const getProductById = async (id: string) => {
  return await prisma.product.findUnique({ where: { id } });
};
```

---

### 🛠️ Next Task for You

1. Run the migration and the seed.
2. Fix the `number` -> `string` type errors in your controllers/services.
3. **Run your tests.** They will likely fail because they expect numeric IDs or because the DB was reset.

**Once your tests are passing again with the new UUID system, are you ready to build the `POST /api/cart` logic?** This is where we’ll handle the "If exists, increment; else, create" logic.
