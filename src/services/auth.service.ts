import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";

export const registerUser = async (userData: any) => {
  // 1. Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // 2. Save to MariaDB
  return await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      // role: userData.role || "CUSTOMER", // Use the role if provided, else default
      role: "CUSTOMER", // 👈 This overrides anything the user tries to send
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

export const loginUser = async (credentials: any) => {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user) throw new Error("Invalid credentials");
  // Inside your login/verify logic
  if (user.status === "BANNED") {
    throw new AppError(
      "Your account has been deactivated. Please contact support.",
      403,
    );
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password,
  );
  if (!isPasswordValid) throw new Error("Invalid credentials");

  // Sign the token
  // const token = jwt.sign(
  //   { userId: user.id, role: user.role },
  //   process.env.JWT_SECRET || "supersecret",
  //   { expiresIn: "1d" },
  // );

  // When creating the token during login/register
  const token = jwt.sign(
    { id: user.id, role: user.role }, // Ensure this is 'id'
    process.env.JWT_SECRET!,
    { expiresIn: "1h" },
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
};
