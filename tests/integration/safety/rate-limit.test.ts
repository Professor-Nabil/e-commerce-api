import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";

describe("Rate Limiting Safety", () => {
  it("should return 429 after exceeding login attempt limits", async () => {
    // We try to login with wrong credentials 6 times
    // Note: If you run this test multiple times, you might get blocked!
    // In CI/test environments, we often disable rate limits or use a shorter window.

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/auth/login")
        .send({ email: "wrong@test.com", password: "wrongpassword" });
    }

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@test.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(429);
    expect(res.body.error.message).toContain("Too many login attempts");
  });
});
