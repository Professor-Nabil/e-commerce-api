### 🏗️ Next Phase: The API Architecture

Now that the "Basics" are done, we need to structure our `/src` folder. Since this is an E-Commerce API, we want to follow the **Controller-Service-Repository** pattern you mastered in the last project, but with an Express twist.

**Here is the folder structure I suggest for `/src`:**

```text
src/
├── config/         # Prisma client instance, env vars
├── controllers/    # Express req/res handling
├── middlewares/    # Auth, validation, error handling
├── models/         # (Optional) Zod schemas for validation
├── routes/         # Express router definitions
└── services/       # Business logic (The "Brain")
```

### 🛠️ First Task: The Prisma Client

Create a file at `src/config/prisma.ts`. We want a single instance of the Prisma Client to use across the whole app.

```typescript
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development due to hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Ready to build your first "Public" route?** I suggest we start with `GET /api/products`. It's the easiest way to test if Express can talk to Prisma and return data to your terminal/Postman.

**Do you want to set up the boilerplate for `app.ts` and the product route now?**
