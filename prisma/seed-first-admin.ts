import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("superadmin", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommerce.com" },
    update: { role: "SUPER_ADMIN" }, // Update existing if it exists
    create: {
      email: "admin@ecommerce.com",
      password: adminPassword,
      role: "SUPER_ADMIN", // 👈 Set to SUPER_ADMIN
    },
  });

  console.log("✅ Created Super Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// NOTE: To run this, you just use
// $ npx tsx prisma/seed.ts
