import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("User Management Integration (Admin)", () => {
  let adminToken: string;
  let customerToken: string;

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
    expect(res.body).toHaveProperty("pagination");
    expect(Array.isArray(res.body.users)).toBe(true);
    // Ensure sensitive data like password is NOT leaked
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
});
