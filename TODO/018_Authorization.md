Good morning! Ready when you are. You’ve got a clean, tested Auth system and a solid MariaDB foundation—now we shift from "Who are you?" (Authentication) to "What are you allowed to do?" (Authorization).

Today's goal is to protect your API. We don't want just anyone (or even any logged-in user) to be able to add or delete products. Only **Admins** should have that power.

---

### 🛠️ The "Auth Guard" Middleware

The first thing we need is a middleware that checks the `Authorization` header for the JWT we created yesterday.

**File:** `src/middlewares/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: { message: "Unauthorized: No token provided" } });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecret",
    ) as any;
    // Attach user info to the request object so controllers can use it
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: { message: "Unauthorized: Invalid token" } });
  }
};
```

---

### 🧪 The TDD "Red" Phase

Let's write a test that proves our security works. We'll try to create a product without a token and expect it to fail.

**New File:** `tests/product.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Product Protection", () => {
  it("should return 401 if a user tries to create a product without a token", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Hacker Laptop",
      price: 999.99,
      stock: 5,
    });

    expect(res.statusCode).toEqual(401);
  });
});
```

---

### 🚀 To get started, I need you to do two things

1. **TypeScript "User" Extension**: Since we are adding `req.user`, TypeScript will complain that `user` doesn't exist on the `Request` type.
    Create a file `src/types/express.d.ts`:

    ```typescript
    declare namespace Express {
      export interface Request {
        user?: {
          userId: number;
          role: string;
        };
      }
    }
    ```

2. **Run the test**:

    ```bash
    npm test tests/product.test.ts
    ```

    (It should fail because we haven't created the `POST /api/products` route yet).

**Once that's done, do you want to build the "Admin-Only" check to ensure customers can't sneak in and change prices?**
