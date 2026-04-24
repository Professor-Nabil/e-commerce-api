Nice catch! A schema is only as good as the middleware it’s attached to. If we don't plug `UpdateCartItemSchema` into the route, someone could theoretically send `quantity: -500` and your database would just accept it.

Let's wire that up and then do a clean sweep of the files to prepare for the commit.

### 1. Apply Schema to Routes

**Edit `./src/routes/cart.routes.ts`**:

```ts
import { Router } from "express";
import {
  addToCart,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  AddToCartSchema,
  UpdateCartItemSchema,
} from "../schemas/cart.schema.js"; // Import it here

const router = Router();

router.get("/", authenticate, getCart);
router.post("/", authenticate, validate(AddToCartSchema), addToCart);
router.delete("/", authenticate, clearCart);

// Specific item operations
router.patch(
  "/:productId",
  authenticate,
  validate(UpdateCartItemSchema), // <--- Wire it up here!
  updateQuantity,
);

router.delete("/:productId", authenticate, removeItem);

export default router;
```

---

### 2. Verify Everything

Since the tests passed, your logic in the `CartService` and `CartController` is solid. By adding the validation middleware now, you've added the "shield" that prevents bad data from ever hitting your service.

**Run the tests one last time to be 100% sure:**

```bash
npx vitest tests/integration/cart/cart-management.test.ts
```

---

### 3. The Commit

Now that the **Cart Management** is fully implemented, validated, and tested, it's time to save your progress.

**Suggested Commit Command:**

```bash
git add .
git commit -m "feat(cart): implement quantity updates, item removal, and clear cart with validation"
```

### 🏁 MVP Progress Report

You are killing it, Nabil. Here is where we stand:

- [x] **Auth**: JWT, Roles, Registration.
- [x] **Products**: Admin CRUD, Soft Delete, Public Listing.
- [x] **Cart**: Add, Update Quantity, Remove Item, Clear Cart.
- [x] **Orders**: Checkout, Order History.

**What's the next move?** We could look at **Stock Management** (preventing a user from adding more items to their cart than you actually have in the warehouse) or perhaps building the **Admin Order Dashboard** to let admins change order statuses from `PENDING` to `COMPLETED`.

What do you think? Use `fzf` to check your `PLAN.md` or just let me know!
