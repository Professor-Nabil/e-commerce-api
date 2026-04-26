import { prisma } from "../config/prisma.js";

export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Fetch users but EXCLUDE the password field
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      // Add other fields you want to see, but NEVER password
    },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.user.count();

  return {
    users,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

export const updateUserStatus = async (
  id: string,
  status: "ACTIVE" | "BANNED",
) => {
  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, email: true, status: true },
  });
};

export const updateUserRole = async (
  id: string,
  role: "ADMIN" | "CUSTOMER",
) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });
};
