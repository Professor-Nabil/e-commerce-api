// ./src/services/auth.service.ts
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import crypto from "crypto";

export const registerUser = async (userData: any) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      role: "CUSTOMER",
      // 🛡️ Create the empty profile linked to this user automatically
      profile: {
        create: {},
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      // We can also return the empty profile object if we want
      profile: true,
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

export const generateResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Security Tip: In a real production app, you might not want to
  // throw a 404 here to prevent "email harvesting," but for our
  // MVP/Dev stage, this is fine.
  if (!user) throw new AppError("No user found with that email", 404);

  // 1. Create a random string (The secret the user gets)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. SHA-256 Hash the token for the database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Store the hash and an expiry (10 mins)
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return resetToken; // User gets the raw string
};

export const resetUserPassword = async (token: string, newPassword: string) => {
  // 1. Hash the token provided by the user to match against the DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) throw new AppError("Token is invalid or has expired", 400);

  // 2. NOW use bcrypt for the actual password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null, // Clear the token so it can't be used again
      resetTokenExpires: null,
    },
  });
};
