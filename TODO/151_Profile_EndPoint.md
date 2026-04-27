To handle the profile logic, we’ll stick to our clean architecture: define the **validation schema**, add the **service** logic, wire up the **controller**, and expose the **route**.

Since every user now has an empty profile created at registration, we'll focus on `get` and `update`.

---

### 1. The Validation Schema

Create a new file `./src/schemas/user.schema.ts` to validate the incoming profile data.

```ts
import { z } from "zod";

export const UpdateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional(),
    shippingAddress: z.string().min(5).max(255).optional(),
  }),
});
```

---

### 2. The Service Layer

Update `./src/services/user.service.ts` to handle the profile queries.

```ts
// ... existing imports and functions

export const getUserProfile = async (userId: string) => {
  return await prisma.profile.findUnique({
    where: { userId },
  });
};

export const updateUserProfile = async (userId: string, data: any) => {
  return await prisma.profile.update({
    where: { userId },
    data,
  });
};
```

---

### 3. The Controller

Update `./src/controllers/user.controller.ts`. We'll add two new functions: `getMyProfile` and `updateMyProfile`.

```ts
// ... existing imports

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profile = await UserService.getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedProfile = await UserService.updateUserProfile(
      req.user.id,
      req.body,
    );
    res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};
```

---

### 4. The Routes

Update `./src/routes/user.routes.ts`. Note that we use a different prefix or specific path to distinguish "Self" actions from "Admin" actions.

```ts
import { Router } from "express";
import {
  changeUserRole,
  getUsers,
  toggleUserBan,
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { UpdateProfileSchema } from "../schemas/user.schema.js";

const router = Router();

// --- Customer Self-Service Routes ---
router.get("/me/profile", authenticate, getMyProfile);
router.patch(
  "/me/profile",
  authenticate,
  validate(UpdateProfileSchema),
  updateMyProfile,
);

// --- Admin Management Routes ---
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);
router.patch("/:id/status", authenticate, authorize(["ADMIN"]), toggleUserBan);
router.patch(
  "/:id/role",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  changeUserRole,
);

export default router;
```

---

### 5. Summary of Changes

- **Safety:** The profile is identified by `req.user.id` (from the JWT), so users can never edit someone else's profile by guessing a UUID in the URL.
- **Validation:** We added Zod validation for the phone number and string lengths.
- **Clean Routes:** `/me/profile` is a common pattern for "current logged-in user" resources.

### 🧪 Quick Verification

You can now try this in your terminal with `curl` or a test:

1. Register a user (Profile is created empty).
2. Login to get a token.
3. `PATCH /api/users/me/profile` with your details.
4. `GET /api/users/me/profile` to see them saved.

**Are you ready to commit this, or should we add a quick integration test for the profile update first?**
