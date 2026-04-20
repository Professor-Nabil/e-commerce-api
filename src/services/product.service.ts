import { prisma } from "../config/prisma.js";

export const getAllProducts = async () => {
  // Prisma makes this look like a standard JS array operation
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
};
