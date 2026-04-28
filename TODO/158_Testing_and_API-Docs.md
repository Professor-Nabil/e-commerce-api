Perfect, the database is in sync. Now let's wire up the remaining pieces and get those tests running.

### 🛠️ 1. Update Swagger Documentation (`src/config/swagger.ts`)

Add the password reset endpoints to your Swagger config.

```typescript
// Inside paths object in src/config/swagger.ts
"/api/auth/forgot-password": {
  post: {
    tags: ["Auth"],
    summary: "Request a password reset token",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["email"],
            properties: {
              email: { type: "string", format: "email" }
            }
          }
        }
      }
    },
    responses: {
      200: { description: "Reset link generated (check console)" },
      404: { description: "Email not found" }
    }
  }
},
"/api/auth/reset-password/{token}": {
  post: {
    tags: ["Auth"],
    summary: "Reset password using token",
    parameters: [
      {
        name: "token",
        in: "path",
        required: true,
        schema: { type: "string" }
      }
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["password"],
            properties: {
              password: { type: "string", minLength: 8 }
            }
          }
        }
      }
    },
    responses: {
      200: { description: "Password updated successfully" },
      400: { description: "Invalid or expired token" }
    }
  }
}
```

---

### 🧪 2. Integration Testing (`tests/integration/auth/password-reset.test.ts`)

We'll create a dedicated test for this flow. Since we're logging the token to the console in the controller, we can either mock the console or (better yet) query the database directly in our test to grab the hashed token for verification.

```typescript
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
    expect(user?.resetToken).not.toBeNull();
    expect(user?.resetTokenExpires).toBeGreaterThan(new Date());
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
```

---

### 📦 3. Verify Everything

1. **Build Check:** `npm run build` (Ensures no TS errors in the new service/controller logic).
2. **Test Run:** `npx vitest tests/integration/auth/password-reset.test.ts`
3. **Swagger:** Restart your server and check `/api-docs` to see the new Auth endpoints.

Once these pass, you have a secure, industry-standard password reset system that uses hashing for tokens just like it does for passwords.

**How's it looking on your end? Any Vitest errors popping up in the terminal?**
