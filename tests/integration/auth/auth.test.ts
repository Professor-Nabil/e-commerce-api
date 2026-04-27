// ./tests/integration/auth/auth.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";

describe("Auth Endpoints Integration", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("test@example.com");
    expect(res.body).toHaveProperty("profile");
    expect(res.body.profile.firstName).toBeNull(); // Should be null initially
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toContain("Invalid email");
  });

  it("should login an existing user and return a token", async () => {
    const credentials = { email: "login@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(credentials);

    const res = await request(app).post("/api/auth/login").send(credentials);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
