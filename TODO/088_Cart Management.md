Commit complete. Your documentation is now in sync with your Admin features.

Based on the code you just shared, your `CartService` is already using Prisma's `upsert` with a composite key (`cartId_productId`), which is great—it's very efficient. Now we just need to add the ability to **update quantity**, **remove an item**, and **flush the cart**.

Here is the plan for the **Cart Refinement Sprint**:

---

### 1. The Service: `./src/services/cart.service.ts`

We need to add three functions. Note that for `updateQuantity`, we will use `update` rather than `upsert` because the item must already exist in the cart to be updated.

```ts
// ... existing code ...

export const updateQuantity = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new Error("Cart not found");

  return await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity },
  });
};

export const removeItem = async (userId: string, productId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new Error("Cart not found");

  return await prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  return await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
};
```

---

### 2. The Controller: `./src/controllers/cart.controller.ts`

We'll hook these up to the request parameters.

```ts
// ... existing code ...

export const updateQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { quantity } = req.body;
    const item = await CartService.updateQuantity(
      req.user!.id,
      req.params.productId,
      quantity,
    );
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await CartService.removeItem(req.user!.id, req.params.productId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await CartService.clearCart(req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
```

---

### 3. The Routes: `./src/routes/cart.routes.ts`

We'll use `PATCH` for updates and `DELETE` for removals.

```ts
import {
  addToCart,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../controllers/cart.controller.js";
// ... existing imports ...

const router = Router();

router.get("/", authenticate, getCart);
router.post("/", authenticate, validate(AddToCartSchema), addToCart);
router.delete("/", authenticate, clearCart); // Clear full cart

// Specific item operations
router.patch("/:productId", authenticate, updateQuantity);
router.delete("/:productId", authenticate, removeItem);

export default router;
```

---

### 4. Next Step: Validation & Testing

We need a small schema for the quantity update (to ensure people don't set quantity to `-5` or `0.5`).

**Do you want to create a new integration test file `./tests/integration/cart/cart-management.test.ts` to verify these three new endpoints?** If yes, let me know and I'll generate the test suite that covers the "Clear Cart" and "Update Quantity" scenarios!
