Since the types are now in sync, let's build the **Order Controller** and the **Routes**. We need to ensure that the new `getAllOrders` and `updateOrderStatus` functions are only accessible to Admins.

### 1. Update `./src/controllers/order.controller.ts`

Add these two functions to your controller. Notice how we use the `OrderStatus` type from Prisma to keep things strictly typed even in the controller.

```ts
import { Request, Response, NextFunction } from "express";
import * as OrderService from "../services/order.service.js";
import { OrderStatus } from "@prisma/client";
import { AppError } from "../utils/appError.js";

// ... existing checkout and getOrderHistory ...

export const getAllOrders = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Basic validation before hitting service
    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw new AppError(
        `Invalid status. Use: ${Object.values(OrderStatus).join(", ")}`,
        400,
      );
    }

    const updatedOrder = await OrderService.updateOrderStatus(
      id,
      status as OrderStatus,
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};
```

---

### 2. Update `./src/routes/order.routes.ts`

Now we hook them up. We’ll use your `authorize` middleware (which I assume is your role-checking middleware) to lock these down to `ADMIN`.

```ts
import { Router } from "express";
import {
  checkout,
  getOrderHistory,
  getAllOrders,
  updateStatus,
} from "../controllers/order.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Customer Routes
router.post("/checkout", authenticate, checkout);
router.get("/history", authenticate, getOrderHistory);

// Admin Routes
router.get("/", authenticate, authorize("ADMIN"), getAllOrders);
router.patch("/:id/status", authenticate, authorize("ADMIN"), updateStatus);

export default router;
```

---

### 3. Verification: The "Build & Test" Loop

Since `tsc` was angry earlier, let's run the full verification in your terminal:

1. **Check Types:** `npx tsc` (Verify it's silent now).
2. **Run Tests:** `npm test` (Ensure we haven't regressed the checkout flow).

### 💡 Implementation Note

Because your `schema.prisma` defines `status` as an `enum`, sending a string like `"SHIPPED"` in the request body will cause the controller validation to fail (rightfully so), because `SHIPPED` isn't in your schema yet.

If you want to support more statuses, you’ll need to:

1. Update `enum OrderStatus` in `schema.prisma`.
2. Run `npx prisma migrate dev --name add_shipped_status`.
3. Run `npx prisma generate`.

How are those `tsc` errors looking now? If they're gone, we should write an integration test for the Admin's ability to update statuses. Ready for that?
