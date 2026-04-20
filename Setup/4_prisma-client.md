# 🛠️ First Task: The Prisma Client

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
