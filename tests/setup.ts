import { config } from "dotenv";
import { execSync } from "child_process";
import { afterAll } from "vitest"; // Import afterAll

config({ path: ".env.test" });

// 1. Generate a unique database name for this worker
const workerId = process.env.VITEST_POOL_ID || "1";
const dbName = `ecommerce_test_db_${workerId}`;
const url = `mysql://root:jjjj@localhost:3306/${dbName}`;

// 2. Inject this URL into the environment so Prisma picks it up
process.env.DATABASE_URL = url;

// 3. Create the database if it doesn't exist and sync schema
// We use a separate administrative command to create the DB first
execSync(
  `mariadb -u root -pjjjj -e "CREATE DATABASE IF NOT EXISTS ${dbName};"`,
);
execSync("npx prisma db push --force-reset");

// export async function teardown() {
//   // Optional: You could drop the DB here if you want to keep your MariaDB clean
//   execSync(`mariadb -u root -pjjjj -e "DROP DATABASE IF EXISTS ${dbName};"`);
// }

// This runs once after all tests in the current worker are finished
afterAll(() => {
  console.log(`🧹 Cleaning up database: ${dbName}`);
  execSync(`mariadb -u root -pjjjj -e "DROP DATABASE IF EXISTS ${dbName};"`);
});
