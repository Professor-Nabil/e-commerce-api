import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // In test mode, we force Prisma to look at the newly injected process.env.DATABASE_URL
    datasources:
      process.env.NODE_ENV === "test"
        ? { db: { url: process.env.DATABASE_URL } }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
