// ./src/services/product.service.ts
import { prisma } from "../config/prisma.js";

export const getAllProducts = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
  } = {},
  sort: string = "newest", // 👈 Add default sort
) => {
  const skip = (page - 1) * limit;

  // 1. Map sort string to Prisma orderBy
  const sortMap: Record<string, any> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
  };

  const orderBy = sortMap[sort] || sortMap.newest;

  const where: any = {
    isDeleted: false,
    // ... keep your existing where logic (categoryId, price, q)
    ...(filters.categoryId && {
      categories: { some: { id: filters.categoryId } },
    }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      },
    }),
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q } },
        { description: { contains: filters.q } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { categories: true, images: true },
      orderBy, // 👈 Use the mapped orderBy
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
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
