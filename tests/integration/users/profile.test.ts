import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getCustomerToken } from "../../helpers/auth.helper.js";

describe("User Profile Integration", () => {
  let token: string;

  beforeAll(async () => {
    // This helper also creates the user, which now triggers profile creation in the service
    token = await getCustomerToken("profile_test@test.com", "password123");
  });

  it("should allow a user to fetch their own empty profile", async () => {
    const res = await request(app)
      .get("/api/users/me/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body.firstName).toBeNull();
  });

  it("should allow a user to update their profile details", async () => {
    const updateData = {
      firstName: "Nabil",
      lastName: "Developer",
      phone: "+213555123456",
      shippingAddress: "123 Arch Linux Way, Algiers",
    };

    const res = await request(app)
      .patch("/api/users/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.profile.firstName).toBe("Nabil");
    expect(res.body.profile.phone).toBe("+213555123456");
  });

  it("should return 400 for invalid phone format", async () => {
    const res = await request(app)
      .patch("/api/users/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "invalid-phone" });

    expect(res.statusCode).toBe(400);
  });
});
