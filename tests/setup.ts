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
