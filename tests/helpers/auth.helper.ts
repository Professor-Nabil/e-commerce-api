// ./tests/helpers/auth.helper.ts
import { prisma } from "../../src/config/prisma.js";
import bcrypt from "bcrypt";
import request from "supertest";
import app from "../../src/app.js";

export const getAdminToken = async (
  email = "admin@test.com",
  password = "password123",
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Ensure Admin exists in DB
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2. Login to get the token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};

export const getCustomerToken = async (
  email = "customer@test.com",
  password = "password123",
) => {
  // Use public API for customer to ensure registration logic works
  await request(app).post("/api/auth/register").send({ email, password });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};
