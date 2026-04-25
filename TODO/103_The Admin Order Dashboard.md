Good morning! You're starting the day with a clean slate and a green test suite—the best way to begin.

Since we wrapped up the **Stock-Aware Cart** and **Checkout** logic last night, the "MVP" branch is looking solid. To move this project toward a complete system, we need to shift focus to the **Admin** side of the house. Currently, orders are created, but they just sit there in the database.

Here is the plan for this session: **The Admin Order Dashboard.**

---

### 🎯 Today's Goals

1. **Admin Order Retrieval:** Create a service/controller to let Admins see _all_ orders (not just their own).
2. **Status Transitions:** Implement a `PATCH` route to update an order's status (e.g., `PENDING` → `SHIPPED` → `DELIVERED`).
3. **Role Protection:** Ensure our `roleMiddleware` is properly guarding these new endpoints.

---

### 🛠️ Step 1: Extending the Order Service

We need to add a function to fetch all orders with their associated items and user details so the Admin knows who bought what.

**Edit `./src/services/order.service.ts`**:
Add this function to the bottom of the file:

```ts
export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  // We could add validation here to ensure the status is a valid enum value
  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};
```

---

### 🚀 Next Step

Before we write the controller and routes, let's verify our `role.middleware.ts` is ready to handle this. You used it for Products, so we just need to plug it into the Order routes.

Shall we start by creating the **Admin Order Controller** to handle these requests?

**Quick check:** Run your existing tests one last time just to make sure the environment is still 100% healthy:

```bash
npm test
```

Ready to dive into the code?
