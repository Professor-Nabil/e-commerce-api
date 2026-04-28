import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";
import crypto from "crypto";

describe("Password Reset Flow", () => {
  const testEmail = "reset@test.com";

  beforeAll(async () => {
    // Create a fresh user for testing
    await request(app).post("/api/auth/register").send({
      email: testEmail,
      password: "oldpassword123",
    });
  });

  it("should generate a reset token and save it to the DB", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testEmail });

    expect(res.statusCode).toBe(200);

    const user = await prisma.user.findUnique({ where: { email: testEmail } });

    const expiryTime = user?.resetTokenExpires?.getTime();
    const currentTime = new Date().getTime();

    expect(expiryTime).toBeGreaterThan(currentTime);
  });

  it("should reset the password successfully with a valid token", async () => {
    // 1. Manually create a token for predictable testing
    const rawToken = "my-secret-test-token";
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.user.update({
      where: { email: testEmail },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: new Date(Date.now() + 10000),
      },
    });

    // 2. Try to reset
    const res = await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: "newpassword123" });

    expect(res.statusCode).toBe(200);

    // 3. Verify login works with new password
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "newpassword123",
    });
    expect(loginRes.statusCode).toBe(200);
  });

  it("should fail if the token is expired", async () => {
    const rawToken = "expired-token";
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.user.update({
      where: { email: testEmail },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: new Date(Date.now() - 1000), // 1 second ago
      },
    });

    const res = await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: "somepassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toMatch(/expired/i);
  });
});
