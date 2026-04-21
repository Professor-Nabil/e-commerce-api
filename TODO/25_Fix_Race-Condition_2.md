That is exactly the information I needed. The story is clear: you are using a single `ecommerce_test_db` for all your test files, and when Vitest spawns multiple workers, they all try to run `db push --force-reset` at the exact same millisecond.

Since you are using MariaDB, we can't just use "file-based" isolation like we did with SQLite. We need to dynamically create a **Schema (Database)** for every worker.

Here is how we kill that race condition for good.

### 1. Update `tests/setup.ts`

We will use `process.env.VITEST_POOL_ID` (which is 1, 2, 3, etc.) to create a unique database name for every worker thread.

```typescript
import { config } from "dotenv";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.test" });

// 1. Generate a unique database name for this worker
const workerId = process.env.VITEST_POOL_ID || "1";
const dbName = `ecommerce_test_db_${workerId}`;
const url = `mysql://root:password@localhost:3306/${dbName}`;

// 2. Inject this URL into the environment so Prisma picks it up
process.env.DATABASE_URL = url;

// 3. Create the database if it doesn't exist and sync schema
// We use a separate administrative command to create the DB first
execSync(
  `mariadb -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS ${dbName};"`,
);
execSync("npx prisma db push --force-reset");

export async function teardown() {
  // Optional: You could drop the DB here if you want to keep your MariaDB clean
  execSync(
    `mariadb -u root -ppassword -e "DROP DATABASE IF EXISTS ${dbName};"`,
  );
}
```

---

### 2. Update `src/config/prisma.ts`

Your current Prisma config is cached globally. We need to make sure that in a **test** environment, the `PrismaClient` re-reads the `DATABASE_URL` we just injected in the setup file.

```javascript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // In test mode, we force Prisma to look at the newly injected process.env.DATABASE_URL
    datasources: process.env.NODE_ENV === "test"
      ? { db: { url: process.env.DATABASE_URL } }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### 3. Update `vitest.config.ts`

Now that we have isolated databases, we don't need to limit ourselves to `forks`. We can go back to full speed, but we must ensure that `setupFiles` runs in the right context.

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    setupFiles: [path.resolve(__dirname, "./tests/setup.ts")],
    environment: "node",
    // We can now run in parallel!
    // If MariaDB struggles with too many connections,
    // you can limit this to pool: 'threads' with a maxInstances.
    pool: "threads",
  },
});
```

---

### 🛠️ Why this works

When you run `npm test`:

1. Vitest starts Worker #1 and Worker #2.
2. Worker #1 sets `DATABASE_URL` to `.../ecommerce_test_db_1` and pushes schema.
3. Worker #2 sets `DATABASE_URL` to `.../ecommerce_test_db_2` and pushes schema.
4. They never touch each other's data. **The Race Condition is dead.**

### One last thing

Since I added the database creation command in `setup.ts`, make sure the password in the `execSync` matches your MariaDB root password.

**Try running `npm test` now with all files. Does it fly?**
