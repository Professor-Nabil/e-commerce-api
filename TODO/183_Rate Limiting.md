This is a great shift in focus. Moving from features to **Safety & Performance** is what separates a "tutorial project" from a "production-ready API."

To protect against brute-force attacks (especially on `/api/auth`), the industry standard for Express is `express-rate-limit`. Since we aren't using Redis yet, we can start with an in-memory store, which is perfect for your current MVP.

### 🛠️ 1. Install the Dependency

First, let's grab the library:

```bash
npm install express-rate-limit
```

### 🛡️ 2. Create the Rate Limiter Middleware

I recommend creating a dedicated config file for this so you can reuse different limits for different routes (e.g., a strict limit for login, a relaxed one for searching products).

Create `src/middlewares/rate-limit.middleware.ts`:

```typescript
import { rateLimit } from "express-rate-limit";

// General limiter for all API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7", // combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: {
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    },
  },
});

// Strict limiter for Auth routes (Login/Register)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // Limit each IP to 5 failed attempts per hour
  skipSuccessfulRequests: true, // Only count 4xx/5xx responses
  message: {
    error: {
      message: "Too many login attempts, please try again after an hour",
    },
  },
});
```

### 🔌 3. Apply to `src/app.ts`

Now, let's wire it up. We'll apply the `apiLimiter` globally and the `authLimiter` specifically to the auth route.

```typescript
// src/app.ts
// ... other imports
import {
  apiLimiter,
  authLimiter,
} from "./middlewares/rate-limit.middleware.js";

const app = express();

// 1. TOP MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter); // Apply general limit to all /api routes

// 2. ROUTES
// ...
app.use("/api/auth", authLimiter, authRoutes); // Apply strict limit specifically to auth
// ...
```

### 🧪 4. Testing the "Invisible" Quality

We need to verify that after 5 failed attempts, the 6th one returns a `429 Too Many Requests`.

Create `tests/integration/safety/rate-limit.test.ts`:

```typescript
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
```

### 💡 A Note on Testing

Since rate limiters persist in memory during the test session, running this test repeatedly might cause issues. In a professional setup, we usually check `process.env.NODE_ENV === 'test'` inside the middleware to either skip it or set much higher limits.

**How do you want to proceed?** Shall we install the package and apply the middleware, or do you want to look at adding a "Slow Down" middleware too (which delays responses instead of blocking them)?
