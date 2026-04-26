// ./tests/integration/users/user.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";
import { prisma } from "../../../src/config/prisma.js";

describe("User Management Integration (Admin)", () => {
  let superAdminToken: string;
  let adminToken: string;
  let customerToken: string;
  let targetUserId: string;

  beforeAll(async () => {
    // Generate tokens with specific roles
    superAdminToken = await getAdminToken(
      "super@test.com",
      "password123",
      "SUPER_ADMIN",
    );
    adminToken = await getAdminToken(
      "admin_user_mgmt@test.com",
      "password123",
      "ADMIN",
    );
    customerToken = await getCustomerToken("regular_user_mgmt@test.com");
  });

  it("should allow an ADMIN to fetch the users list with pagination", async () => {
    const res = await request(app)
      .get("/api/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(Array.isArray(res.body.users)).toBe(true);

    // 👈 Capture the ID of the customer we just created via the helper
    const customer = res.body.users.find(
      (u: any) => u.email === "regular_user_mgmt@test.com",
    );
    targetUserId = customer?.id;

    if (res.body.users.length > 0) {
      expect(res.body.users[0]).not.toHaveProperty("password");
    }
  });

  it("should return 403 Forbidden when a CUSTOMER tries to access the list", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should return 401 Unauthorized if no token is provided", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(401);
  });

  it("should prevent a BANNED user from logging in", async () => {
    expect(targetUserId).toBeDefined();

    // Standard ADMIN can ban users
    await request(app)
      .patch(`/api/users/${targetUserId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "BANNED" });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "regular_user_mgmt@test.com",
      password: "password123",
    });

    expect(loginRes.statusCode).toBe(403);
  });

  it("should NOT allow a standard ADMIN to promote a user", async () => {
    const res = await request(app)
      .patch(`/api/users/${targetUserId}/role`)
      .set("Authorization", `Bearer ${adminToken}`) // 👈 Should fail
      .send({ role: "ADMIN" });

    expect(res.statusCode).toBe(403);
    expect(res.body.error.message).toContain("Super Admins");
  });

  it("should allow a SUPER_ADMIN to promote a CUSTOMER", async () => {
    // 1. Unban first
    await request(app)
      .patch(`/api/users/${targetUserId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "ACTIVE" });

    // 2. Promote using SUPER_ADMIN token
    const promoRes = await request(app)
      .patch(`/api/users/${targetUserId}/role`)
      .set("Authorization", `Bearer ${superAdminToken}`) // 👈 Success!
      .send({ role: "ADMIN" });

    expect(promoRes.statusCode).toBe(200);
    expect(promoRes.body.user.role).toBe("ADMIN");

    // 3. Verify new admin can access admin routes
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "regular_user_mgmt@test.com",
      password: "password123",
    });

    const accessRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(accessRes.statusCode).toBe(200);
  });
  it("should allow a SUPER_ADMIN to create another SUPER_ADMIN", async () => {
    const res = await request(app)
      .patch(`/api/users/${targetUserId}/role`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ role: "SUPER_ADMIN" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe("SUPER_ADMIN");
  });

  it("should NOT allow demoting the last SUPER_ADMIN", async () => {
    // 1. First, demote the 'extra' Super Admin we created in the previous test
    // so that only one remains in the DB.
    await request(app)
      .patch(`/api/users/${targetUserId}/role`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ role: "CUSTOMER" });

    // 2. Now find the absolute last Super Admin (the one used for the token)
    const lastSuperAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    // 3. Try to demote the last one
    const res = await request(app)
      .patch(`/api/users/${lastSuperAdmin?.id}/role`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ role: "CUSTOMER" });

    // 4. This should now correctly return 400
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toMatch(
      /At least one Super Admin must exist/i,
    );
  });
});
