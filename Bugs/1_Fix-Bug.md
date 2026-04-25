# The Bug

```bash
npm test
```

```txt
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/e2e/checkout.test.ts [ tests/e2e/checkout.test.ts ]
Error: Cannot find module '.prisma/client/default'
Require stack:
- /home/nabil/Github_Nabil_Tester/e-commerce-api/node_modules/@prisma/client/default.js
 ❯ Object.<anonymous> node_modules/@prisma/client/default.js:2:6

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 9 passed (10)
      Tests  27 passed (27)
   Start at  11:04:50
   Duration  22.43s (transform 570ms, setup 45.95s, import 5.36s, tests 6.02s, environment 3ms)

~/Github_Nabil_Tester/e-commerce-api (mvp ✗)
```

# 🛠️ Fixing the "Cannot find module '.prisma/client/default'" Error

This specific error in Vitest usually happens because the Prisma client hasn't been properly synchronized with the generated files in `node_modules`, or there is a race condition where the test runner is trying to access the client while it's being regenerated.

Since you're on **Arch Linux**, the way node handles the `.prisma` cache can sometimes get out of sync during frequent migrations.

#### 1. The "Nuclear" Sync (Fixes 90% of Prisma/Vitest issues)

Run this command to force a clean regeneration and clear the cache:

```bash
rm -rf node_modules/.prisma
npx prisma generate
```

#### 2. Vitest Config Check

If it keeps happening "randomly," it's likely a **concurrency issue**. Vitest runs tests in parallel by default. If multiple tests are hitting the database or the Prisma client simultaneously while a migration or generation is pending, it fails.

Try running your tests with the `--pool=threads` or `--no-file-parallelism` flag, or ensure your `vitest.config.ts` (if you have one) has `threads` limited.

**Try running tests like this to see if it stabilizes:**

```bash
npx vitest run --pool=forks
```

#### 3. Update the Prisma Client import

In some environments, importing from `@prisma/client` can be flaky if the symlink is broken. Ensure your `src/config/prisma.ts` looks exactly like this:

```ts
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
```

---

### 📋 What's the plan for next session?

Now that Categories are live and we're fixing the test flakes, what’s next on your terminal?

1. **Filtering & Search:** Making `GET /api/products?category=Vintage` work.
2. **Product Images:** Setting up the logic to handle product photos.
3. **User Profiles:** Allowing Nabil (or any user) to update their shipping info.

**Give that `rm -rf` and `generate` combo a shot—did the checkout test pass this time?**
