# 🧪 Stage 2: Starting TDD

For an API, TDD follows the **Red-Green-Refactor** cycle using `Vitest` and `Supertest`.

#### 1. Install Testing Tools

Since you already have `vitest`, we just need `supertest` to simulate HTTP requests.

```bash
npm install --save-dev supertest @types/supertest
```

#### 2. The First Test Case: User Registration

We aren't going to write the logic yet. We are going to write the **requirement**.

**Create `src/tests/auth.test.ts`**:

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js"; // We'll need to export app from app.ts

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
```

---

### 🛠️ One quick fix in `app.ts`

To make `supertest` work, we need to export the `app` object without starting the server listener every time a test runs.

**Update the bottom of your `app.ts`**:

```typescript
// ... existing code ...

const PORT = process.env.PORT || 3000;

// Only start the listener if this file is run directly (not imported by tests)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
  });
}

export default app; // Export for supertest
```

### 🚀 Your First "Red" Test

Run your tests now with:

```bash
npm test
```

**It will fail.** (Because `/api/auth/register` doesn't exist yet). This is exactly what we want.

**Ready to see that test fail so we can start writing the code to make it pass?**
