You're absolutely right to stop here. That **Race Condition** is back because MariaDB/MySQL handles concurrent schema changes differently than the SQLite setup we had in the Task Tracker.

In your current setup, Vitest is running multiple test files in parallel. Each file calls `tests/setup.ts`, which tries to run `npx prisma db push --force-reset` on the **exact same database** (`ecommerce_test_db`) at the same time. One worker is trying to delete the tables while the other is trying to create them.

To fix this, we need to apply the same logic from your previous success: **Dynamic Isolated Databases**.

Please show me these three files so I can give you the exact fix:

1. **`tests/setup.ts`**: To see how we are currently triggering the push.
2. **`src/config/prisma.ts`**: To see how the `PrismaClient` is instantiated (we'll need to override the URL here).
3. **`vitest.config.ts`**: To see your current pool/thread settings.

### The Plan

I'm going to help you implement a "Schema per Worker" strategy. Instead of everyone fighting over `ecommerce_test_db`, each Vitest worker will get its own temporary database (e.g., `test_db_1`, `test_db_2`).

**While you get those files ready, here is the concept:**

- We will use `process.env.VITEST_POOL_ID` (a unique ID Vitest gives to every worker).
- We will dynamically change the `DATABASE_URL` for each worker.
- We will run the schema sync once per database.

**Post those files and let's kill this bug again!**
