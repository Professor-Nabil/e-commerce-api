# 🛒 Next Step: The Shopping Cart Logic

The Shopping Cart is more than just a table; it's a **Workflow**. Unlike products, which are just "created," a cart item requires "Upsert" logic:

1. If the item isn't in the cart: **Create it.**
2. If the item is already there: **Increment the quantity.**

#### 1. The Strategy

We need to protect these routes. A user should only be able to modify their **own** cart. Since we have `req.user` from our `authenticate` middleware, we will use that `userId` to find or create the cart.

#### 2. The Service

Create a new file `src/services/cart.service.ts`. We will use Prisma's `upsert` or a transaction to keep it atomic.

```typescript
import { prisma } from "../config/prisma.js";

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  // 1. Ensure the user has a cart
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // 2. Upsert the CartItem
  return await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });
};
```

---

### 🧪 The TDD "Red" Phase

Let's prepare the test. We want to ensure that if I add the same product twice, the quantity becomes `2` instead of creating two separate rows.

**Create File:** `tests/cart.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Shopping Cart", () => {
  it("should add an item to the cart and increment quantity on second add", async () => {
    // 1. Register & Login as a CUSTOMER
    const user = { email: "customer@test.com", password: "password123" };
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app).post("/api/auth/login").send(user);
    const token = loginRes.body.token;

    // 2. Get a product ID (use your seed or create one)
    const productRes = await request(app).get("/api/products");
    const productId = productRes.body[0].id;

    // 3. Add to cart first time
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId, quantity: 1 });

    // 4. Add to cart second time
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId, quantity: 1 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.quantity).toEqual(2);
  });
});
```

---

### 🚀 Your Task

To move forward, I need you to:

1. **Create the Cart Controller** using the service logic above.
2. **Define the Route** `POST /api/cart`.
3. **Create a Zod Schema** for the cart input (it should validate `productId` as a string and `quantity` as a positive integer).

**Should I provide the Controller and Zod code for you, or do you want to try writing the "Add to Cart" controller yourself first?** (Remember: `req.user.userId` is your key here!)
