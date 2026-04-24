## 📊 MVP Progress Review

We've made massive progress today, Nabil. Your backend is starting to look like a production-ready system. Here is the breakdown:

### ✅ Completed (Done & Dusted)

- **Admin Power:** Product **Update** (PATCH) and **Soft Delete** implemented with Zod validation.
- **Cart Control:** Customers can now **Update Quantity**, **Remove Items**, and **Clear Cart**.
- **Documentation:** Swagger is 100% in sync with all new Product and Cart endpoints.
- **Safety:** Integrated tests ensure that only Admins can touch sensitive product data.

### ⏳ Remaining for the Next Sprint

- **Stock Validation:** Preventing users from adding more to the cart than is available in the warehouse.
- **Admin Order Dashboard:** Allow Admins to view all orders and update statuses (PENDING -> SHIPPED -> COMPLETED).
- **User Profile:** Endpoints to update personal info or change passwords.
- **Stock decrement on Checkout:** Actually reducing the `Product.stock` count once a payment/checkout is successful.

---

## 🚀 Next Mission: Stock Integrity & Validation

Since we just finished the Cart, the most logical (and critical) next step is **Stock Validation**. Right now, a user could add 9,999 items to their cart even if you only have 5 in stock. We need to stop that at the "Add to Cart" and "Update Quantity" levels.

### 1. Update the Schema: `./src/schemas/cart.schema.ts`

We don't need to change the schema itself (as `positive()` is already there), but we will use the logic in the service to check against the DB stock.

### 2. The Logic: `./src/services/cart.service.ts`

We need to modify `addToCart` and `updateQuantity` to verify availability.

```ts
// Update to addToCart in src/services/cart.service.ts
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  // 1. Check if product exists AND check stock
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || product.isDeleted) {
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    throw new Error(
      `Insufficient stock. Only ${product.stock} items available.`,
    );
  }

  // ... existing cart lookup and upsert logic ...
};
```

### 3. The Integration Test: `./tests/integration/cart/stock-validation.test.ts`

Let's build a dedicated test for this to ensure our "Gatekeeper" logic works.

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";
import { getCustomerToken } from "../../helpers/auth.helper.js";

describe("Cart Stock Validation", () => {
  let userToken: string;
  let limitedProductId: string;

  beforeAll(async () => {
    userToken = await getCustomerToken("stock_tester@test.com");

    const product = await prisma.product.create({
      data: {
        name: "Limited Edition Keycap",
        description: "Only a few in existence.",
        price: 50,
        stock: 5, // Only 5 in stock
      },
    });
    limitedProductId = product.id;
  });

  it("should fail if user tries to add more than available stock", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId: limitedProductId, quantity: 10 });

    expect(res.statusCode).toBe(400);
    // Note: We might need to handle this error specifically in our error middleware
    expect(res.body.error.message).toContain("Insufficient stock");
  });

  it("should fail if user updates quantity to exceed stock", async () => {
    // Add valid amount first
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId: limitedProductId, quantity: 1 });

    // Try to update to 10
    const res = await request(app)
      .patch(`/api/cart/${limitedProductId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.statusCode).toBe(400);
  });
});
```

### ⌨️ Let's go

1. Update `src/services/cart.service.ts` with the stock checks.
2. Create the test file above.
3. Run it and watch it fail (because we haven't mapped the `Error` to a `400` status yet in the global error handler).

Ready to tighten up the warehouse logic? Give me a `ls` of your `src/services` to make sure we're looking at the right version of the file.
