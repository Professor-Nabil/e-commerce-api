import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client"; // Import the Prisma namespace

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    where: { isDeleted: false }, // Only show active products
    include: {
      categories: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// export const updateProduct = async (
//   id: string,
//   data: Prisma.ProductUpdateInput,
// ) => {
//   return await prisma.product.update({
//     where: { id },
//     data,
//   });
// };
export const updateProduct = async (
  id: string,
  data: any,
  filePaths: string[] = [],
) => {
  const { categoryNames, ...productData } = data;

  return await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      // If new files are uploaded, we append them
      images: {
        create: filePaths.map((path) => ({ url: path })),
      },
    },
    include: {
      categories: true,
      images: true,
    },
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

// Old Code:
// export const createProduct = async (data: Prisma.ProductCreateInput) => {
//   return await prisma.product.create({
//     data,
//   });
// };
// New Code:
export const createProduct = async (data: any, filePaths: string[] = []) => {
  const { categoryNames, ...productData } = data;

  return await prisma.product.create({
    data: {
      ...productData,
      categories: {
        connectOrCreate: categoryNames?.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
      // Link the uploaded file paths here
      images: {
        create: filePaths.map((path) => ({ url: path })),
      },
    },
    include: {
      categories: true,
      images: true,
    },
  });
};

export const getProductById = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      categories: true,
      images: true,
    },
  });
};
