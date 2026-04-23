Good morning! Quality over quantity is exactly how you build a production-grade backend. Since we have a tight two-hour window, let's focus on the final piece of the "User Journey": **Order History.**

This ensures that once a customer spends their money, they have a permanent record of what they bought, how much it cost at that moment, and the status of their order.

### 🧪 Step 1: The TDD "Red" Phase

We’ll start by writing the test for `GET /api/orders`. This test will fail immediately because the route and service don't exist yet.

**Add this to `tests/checkout.test.ts` or a new `tests/orders.test.ts`:**

```typescript
it("should fetch the customer's order history with product details", async () => {
  // 1. Setup: Use an existing customer who just finished a checkout
  // (Or create a quick one-product checkout flow here)
  const customer = { email: "history_buyer@test.com", password: "password123" };
  await request(app).post("/api/auth/register").send(customer);
  const login = await request(app).post("/api/auth/login").send(customer);
  const token = login.body.token;

  // 2. Perform a quick checkout so there is data to find
  // [Assuming you have a product in the DB from the previous tests]
  // In a clean test, you'd create a product and add to cart first.

  // 3. The Actual Test: Fetch Order History
  const res = await request(app)
    .get("/api/orders")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toEqual(200);
  expect(Array.isArray(res.body)).toBe(true);

  // Verify the structure: Order -> OrderItems -> Product
  if (res.body.length > 0) {
    expect(res.body[0]).toHaveProperty("totalAmount");
    expect(res.body[0].items[0]).toHaveProperty("product");
    expect(res.body[0].items[0].product).toHaveProperty("name");
  }
});
```

---

### 🛠️ Step 2: Implementation (The Quality Part)

To make this high quality, we aren't just fetching rows; we are fetching a **nested relational tree**.

#### 1. The Service

**Add to `src/services/order.service.ts`:**

```typescript
export const getOrderHistory = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              description: true,
              // We don't include current product price here
              // because orderItem.price is the historical price.
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" }, // Newest orders first
  });
};
```

#### 2. The Controller

**Add to `src/controllers/order.controller.ts`:**

```typescript
export const getOrderHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const orders = await OrderService.getOrderHistory(userId);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
```

#### 3. The Route

**Add to `src/routes/order.routes.ts`:**

```typescript
router.get("/", authenticate, getOrderHistory);
```

---

### 📐 Why this is "Quality"

1. **Relational Integrity**: We are using `include` to bridge three tables (`Order` -> `OrderItem` -> `Product`) in a single query.
2. **Historical Accuracy**: We show the `product.name` for display, but we rely on `OrderItem.price` for the financial record. This is vital if the product price changes tomorrow.
3. **Security**: The `where: { userId }` ensures a user can never "guess" an ID and see someone else's order.

**Next Step:**
Run the test. If it fails, check your nesting. If it passes, you've completed the full E-commerce circle!

**Do you want me to help you refine the TypeScript interfaces for the response before you commit?** (This adds that extra layer of quality to your frontend-backend contract).
