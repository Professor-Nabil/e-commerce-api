import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client"; // Import the Prisma namespace

export const getAllProducts = async () => {
  // Prisma makes this look like a standard JS array operation
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const createProduct = async (data: Prisma.ProductCreateInput) => {
  return await prisma.product.create({
    data,
  });
};
