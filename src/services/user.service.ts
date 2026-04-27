import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";

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
  // 🛡️ Safety Check: Prevent banning the last SUPER_ADMIN
  if (status === "BANNED") {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN", status: "ACTIVE" },
      });
      if (superAdminCount <= 1) {
        throw new AppError(
          "Operation denied: Cannot ban the only active Super Admin.",
          400,
        );
      }
    }
  }

  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, email: true, status: true },
  });
};

export const updateUserRole = async (
  id: string,
  role: "ADMIN" | "CUSTOMER" | "SUPER_ADMIN",
) => {
  // 🛡️ Safety Check: Prevent demoting the last SUPER_ADMIN
  const targetUser = await prisma.user.findUnique({ where: { id } });

  if (targetUser?.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });

    if (superAdminCount <= 1) {
      throw new AppError(
        "Operation denied: At least one Super Admin must exist.",
        400,
      );
    }
  }

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

export const getUserProfile = async (userId: string) => {
  return await prisma.profile.findUnique({
    where: { userId },
  });
};

export const updateUserProfile = async (userId: string, data: any) => {
  return await prisma.profile.update({
    where: { userId },
    data,
  });
};
