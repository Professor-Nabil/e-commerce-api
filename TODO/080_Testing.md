Since your testing infrastructure is already set up with `auth.helper.ts`, writing these tests will be very straightforward. To get this running, make sure you've already run the Prisma migration to add `isDeleted` to your database.

Here is the integration test file for your new Admin features.

### 🧪 `./tests/integration/products/admin-product.test.ts`

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/config/prisma.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("Admin Product Management (Update & Soft Delete)", () => {
  let adminToken: string;
  let customerToken: string;
  let targetProductId: string;

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_crud@test.com");
    customerToken = await getCustomerToken("normal_user@test.com");

    // Create a product to use for update and delete tests
    const product = await prisma.product.create({
      data: {
        name: "Original Name",
        description: "Original Description which is long enough",
        price: 100,
        stock: 10,
      },
    });
    targetProductId = product.id;
  });

  describe("PATCH /api/products/:id (Update)", () => {
    it("should allow an admin to update only the price", async () => {
      const res = await request(app)
        .patch(`/api/products/${targetProductId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ price: 150 });

      expect(res.statusCode).toBe(200);
      expect(Number(res.body.price)).toBe(150);
      expect(res.body.name).toBe("Original Name"); // Name should remain unchanged
    });

    it("should return 403 if a customer tries to update a product", async () => {
      const res = await request(app)
        .patch(`/api/products/${targetProductId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "Hacked Name" });

      expect(res.statusCode).toBe(403);
    });

    it("should return 400 for invalid update data (price < 0)", async () => {
      const res = await request(app)
        .patch(`/api/products/${targetProductId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ price: -50 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("DELETE /api/products/:id (Soft Delete)", () => {
    it("should mark the product as deleted and return 204", async () => {
      const res = await request(app)
        .delete(`/api/products/${targetProductId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      // Verify in DB that it still exists but isDeleted is true
      const dbProduct = await prisma.product.findUnique({
        where: { id: targetProductId },
      });
      expect(dbProduct?.isDeleted).toBe(true);
      expect(dbProduct?.deletedAt).not.toBeNull();
    });

    it("should hidden the soft-deleted product from public list", async () => {
      const res = await request(app).get("/api/products");

      // The product we just deleted should not be in the list
      const productInList = res.body.find((p: any) => p.id === targetProductId);
      expect(productInList).toBeUndefined();
    });

    it("should still allow viewing a deleted product by ID (for order history consistency)", async () => {
      // NOTE: You can decide if getProductById should hide deleted items.
      // Usually, it's better to allow it so order details still work.
      const res = await request(app).get(`/api/products/${targetProductId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.isDeleted).toBe(true);
    });
  });
});
```

---

### 🧠 Why the logic works this way

1. **Partial Updates**: By using `UpdateProductSchema = CreateProductSchema.partial()`, Zod allows the Admin to send just `{ price: 150 }` without needing to resend the name and description.
2. **Order Integrity**: If you check your `OrderItem` model, it points to `productId`. If we did a hard delete, that link would break, or the database would prevent the delete. With **Soft Delete**, the database record stays, so the user can still see what they bought in 2026 even if you don't sell it anymore.
3. **Filter Leakage**: We updated `getAllProducts` in the service to include `where: { isDeleted: false }`. This is your primary shield—customers will never see "deleted" items in the shop.

### ⌨️ Terminal Commands to finish this

1. **Migrate:** `npx prisma migrate dev --name add_soft_delete`
2. **Run Tests:** `npx vitest tests/integration/products/admin-product.test.ts`

Does this look solid to you? Once this passes, the **Admin Logistics** section of your checklist is almost half-done!
