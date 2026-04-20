import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js"; // We'll need to export app from app.ts

describe("Auth Endpoints", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("test@example.com");
  });
});
