```bash
# .env.test
DATABASE_URL="mysql://root:password@localhost:3306/ecommerce_test_db"
NODE_ENV="test"
```

```bash
mariadb -u root -p -e "CREATE DATABASE ecommerce_test_db;"
```

```bash
npm install --save-dev dotenv
```

**Create `tests/setup.ts`**:

```typescript
import { config } from "dotenv";
import { execSync } from "child_process";
import { prisma } from "../src/config/prisma.js";

// 1. Load the test environment variables
config({ path: ".env.test" });

// 2. Sync the test database schema
// This is like running 'migrate dev' but faster for testing
execSync("npx prisma db push --force-reset");

export async function teardown() {
  await prisma.$disconnect();
}
```

### 4. Update `package.json` Scripts

```json
"scripts": {
  "test": "NODE_ENV=test vitest run"
}
```

And update your `vitest.config.ts` (or add it if you don't have it):

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Option A: Use path.resolve to be safe
    setupFiles: [path.resolve(__dirname, "./tests/setup.ts")],

    // Option B: Ensure environment is set to node
    environment: "node",

    // Disable threads to prevent MariaDB connection issues during parallel runs
    pool: "forks",
  },
});
```

---

### 5. Why `npx prisma db push --force-reset`?

In your `setup.ts`, we use `db push`. Unlike `migrate dev`, it doesn't care about migration history files; it just makes the database match your `schema.prisma` immediately. The `--force-reset` ensures that every time you run `npm test`, the database is **wiped clean**.

### 🧪 Test the Isolation

1. Run `npm test`. It should pass.
2. Check your development database: `mariadb -u root -p -e "USE ecommerce_db; SELECT * FROM User;"` -> **It should be empty.**
3. Check your test database: `mariadb -u root -p -e "USE ecommerce_test_db; SELECT * FROM User;"` -> **It will have your test user.**

**Does the `db push` run smoothly on your Arch machine?** Once this is set, you can run your tests 100 times and they will never fail due to "Duplicate Entry" errors!
