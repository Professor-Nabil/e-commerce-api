Thanks for sharing the current state. This is perfect because we already have `getOrderHistory`, so adding the specific `getOrderById` will follow the same pattern but with the added security check to make sure one customer can't snoop on another's orders.

### 🛠️ 1. Update the Service Layer

In `src/services/order.service.ts`, we add a function to fetch a single order with its items and basic product details.

```typescript
export const getOrderDetails = async (orderId: string) => {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: { take: 1 }, // Get one thumbnail
            },
          },
        },
      },
    },
  });
};
```

---

### 🎮 2. Update the Controller

In `src/controllers/order.controller.ts`, we implement the logic. We'll use your existing `req.user!` pattern since the route will be protected by `authenticate`.

```typescript
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderDetails(id);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // 🛡️ Security: Check if owner or admin
    const isOwner = order.userId === req.user!.id;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);

    if (!isOwner && !isAdmin) {
      throw new AppError("Forbidden: You do not own this order", 403);
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
```

---

### 🛣️ 3. Update the Routes

In `src/routes/order.routes.ts`, we add the new GET endpoint.

```typescript
// Customer & Shared Routes
router.get("/", authenticate, getOrderHistory);
router.get("/:id", authenticate, getOrderById); // 👈 New route
router.post("/checkout", authenticate, checkout);
```

---

### 🧪 4. Integration Test

Create a new test file or add to your order tests (e.g., `tests/integration/orders/order-details.test.ts`) to ensure a customer cannot access an order belonging to someone else.

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getCustomerToken } from "../../helpers/auth.helper.js";

describe("Order Details Access Control", () => {
  let userAToken: string;
  let userBToken: string;
  let orderAId: string;

  beforeAll(async () => {
    userAToken = await getCustomerToken("userA@test.com", "password123");
    userBToken = await getCustomerToken("userB@test.com", "password123");

    // 1. User A performs a checkout to create an order
    // (Assuming you have products in your test DB via setup/seeds)
    // For this test, we assume the checkout works and gives us an order ID.
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${userAToken}`);

    orderAId = res.body.id;
  });

  it("should allow User A to view their own order", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderAId}`)
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(orderAId);
  });

  it("should prevent User B from viewing User A's order", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderAId}`)
      .set("Authorization", `Bearer ${userBToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error.message).toContain("Forbidden");
  });
});
```

### 📖 5. Swagger Update

Don't forget to add the `GET /api/orders/{id}` endpoint to `src/config/swagger.ts` so you can test it from the browser UI.

**Does this implementation match your vision for the Order History flow?** I'm ready to help you refine the Swagger docs for this if you'd like.
