import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";

export const registerUser = async (userData: any) => {
  // 1. Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // 2. Save to MariaDB
  return await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
    },
    select: {
      // Don't return the password to the user!
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};
