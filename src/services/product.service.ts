import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client"; // Import the Prisma namespace

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    where: { isDeleted: false }, // Only show active products
    orderBy: { createdAt: "desc" },
  });
};

export const updateProduct = async (
  id: string,
  data: Prisma.ProductUpdateInput,
) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};

export const softDeleteProduct = async (id: string) => {
  return await prisma.product.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

export const createProduct = async (data: Prisma.ProductCreateInput) => {
  return await prisma.product.create({
    data,
  });
};

export const getProductById = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
  });
};
