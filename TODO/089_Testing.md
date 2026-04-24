I love the enthusiasm! Testing the cart is vital because it involves complex state (user ownership, stock relations, and item persistence). Since you’re already using the `cartId_productId` composite key in Prisma, these tests will confirm that our logic correctly targets individual items.

### 🧪 `./tests/integration/cart/cart-management.test.ts`

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";
import { getCustomerToken } from "../../helpers/auth.helper.js";

describe("Cart Management Integration (Update, Remove, Clear)", () => {
  let userToken: string;
  let productId: string;

  beforeAll(async () => {
    userToken = await getCustomerToken("cart_tester@test.com");

    // Create a dummy product for the cart
    const product = await prisma.product.create({
      data: {
        name: "Test Mechanical Keyboard",
        description: "A very clicky keyboard for terminal users.",
        price: 150,
        stock: 50,
      },
    });
    productId = product.id;

    // Pre-fill the cart for testing
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
  });

  describe("PATCH /api/cart/:productId", () => {
    it("should update the quantity of a specific item", async () => {
      const res = await request(app)
        .patch(`/api/cart/${productId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body.quantity).toBe(5);

      // Verify in DB
      const cart = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${userToken}`);

      const item = cart.body.items.find((i: any) => i.productId === productId);
      expect(item.quantity).toBe(5);
    });
  });

  describe("DELETE /api/cart/:productId", () => {
    it("should remove a specific item from the cart", async () => {
      const res = await request(app)
        .delete(`/api/cart/${productId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(204);

      // Verify cart is now empty for this product
      const cart = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${userToken}`);

      const item = cart.body.items.find((i: any) => i.productId === productId);
      expect(item).toBeUndefined();
    });
  });

  describe("DELETE /api/cart", () => {
    it("should clear all items from the cart", async () => {
      // First, add two different items
      const p2 = await prisma.product.create({
        data: { name: "Item 2", description: "Desc", price: 10, stock: 10 },
      });

      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ productId: p2.id, quantity: 1 });

      // Clear everything
      const res = await request(app)
        .delete("/api/cart")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(204);

      // Verify cart is empty
      const cart = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${userToken}`);

      expect(cart.body.items.length).toBe(0);
    });
  });
});
```

---

### 🛠️ One quick thing before you run this

We need a simple **Zod Schema** for the `PATCH` update so that users don't send `quantity: "a lot"` or `quantity: -1`.

**Update `./src/schemas/cart.schema.ts`**:

```ts
import { z } from "zod";

export const AddToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  }),
});

// New schema for updates
export const UpdateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive(),
  }),
});
```

And don't forget to add the `validate(UpdateCartItemSchema)` middleware to your `PATCH` route in `cart.routes.ts`.

### 🚀 To run the test

1. Save the service, controller, and route changes we discussed.
2. Add the Zod schema.
3. Run:

```bash
npx vitest tests/integration/cart/cart-management.test.ts
```

Once this is green, your **Cart & Checkout** section on the checklist is officially 100% complete! Ready to send the code?
