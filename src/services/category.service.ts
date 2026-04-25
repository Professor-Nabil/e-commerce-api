import { prisma } from "../config/prisma.js";

export const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const createCategory = async (name: string) => {
  return await prisma.category.create({
    data: { name },
  });
};

export const deleteCategory = async (id: string) => {
  return await prisma.category.delete({
    where: { id },
  });
};
