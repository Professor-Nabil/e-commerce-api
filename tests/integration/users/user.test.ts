import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("User Management Integration (Admin)", () => {
  let adminToken: string;
  let customerToken: string;
  let targetUserId: string; // 👈 Define the ID variable here

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_user_mgmt@test.com");
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
    // Ensure we have a user to ban
    expect(targetUserId).toBeDefined();

    // 1. Admin bans the user
    const banRes = await request(app)
      .patch(`/api/users/${targetUserId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "BANNED" });

    expect(banRes.statusCode).toBe(200);

    // 2. User tries to login
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "regular_user_mgmt@test.com", // 👈 Must match the banned user
      password: "password123",
    });

    expect(loginRes.statusCode).toBe(403);
    expect(loginRes.body.error.message).toMatch(/deactivated|banned/i);
  });

  it("should allow an ADMIN to promote a CUSTOMER and the new ADMIN can then access admin routes", async () => {
    // 1. Unban the user first (since the previous test banned them)
    await request(app)
      .patch(`/api/users/${targetUserId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "ACTIVE" });

    // 2. Admin promotes the Customer to ADMIN
    const promoRes = await request(app)
      .patch(`/api/users/${targetUserId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "ADMIN" });

    expect(promoRes.statusCode).toBe(200);
    expect(promoRes.body.user.role).toBe("ADMIN");

    // 3. The user MUST re-login to get a new JWT with the ADMIN role
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "regular_user_mgmt@test.com",
      password: "password123",
    });

    const newAdminToken = loginRes.body.token;

    // 4. Verify the new token now allows access to the user list (Admin only)
    const accessRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${newAdminToken}`);

    expect(accessRes.statusCode).toBe(200);
  });
});
