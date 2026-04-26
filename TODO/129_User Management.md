Starting the **User Management** section is a great way to kick off the session. As an admin, being able to oversee who is registered on the platform is essential for security and support.

Since we are dealing with a potentially large number of users, we should implement this with **Pagination** and **Search** in mind from the start, so it doesn't break when your database grows.

---

### 🛠️ 1. The Service Layer

First, let's create the logic to fetch users in `src/services/user.service.ts`. We want to make sure we don't accidentally send back passwords!

```typescript
import prisma from "../config/db.js";

export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Fetch users but EXCLUDE the password field
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      // Add other fields you want to see, but NEVER password
    },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.user.count();

  return {
    users,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};
```

---

### 🎮 2. The Controller

Now, create the handler in `src/controllers/user.controller.ts`.

```typescript
import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/user.service.js";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UserService.getAllUsers(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
```

---

### 🛣️ 3. The Route

We need to protect this route. Only an **ADMIN** should ever be able to list all users. Update `src/routes/user.routes.ts` (or create it if it doesn't exist):

```typescript
import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Only Admins allowed
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);

export default router;
```

---

### 🛡️ 4. Register the Route

Don't forget to wire it up in your `src/app.ts`:

```typescript
import userRoutes from "./routes/user.routes.js";

// ... other imports
app.use("/api/users", userRoutes);
```

---

### 🧪 5. Quick Integration Test

To wrap this up, add a test case to ensure a customer can't peek at other users.

```typescript
describe("User Management (Admin)", () => {
  it("should return 403 if a CUSTOMER tries to list users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should allow an ADMIN to list all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.users).toBeDefined();
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});
```

How does that look for the first task of the day? Ready to move on to **Carts** or should we add a search filter for emails first?
