// ./src/services/product.service.ts
import { prisma } from "../config/prisma.js";

export const getAllProducts = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  // Run count and fetch in parallel for efficiency
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        categories: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: { isDeleted: false } }),
  ]);

  return {
    products,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

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
