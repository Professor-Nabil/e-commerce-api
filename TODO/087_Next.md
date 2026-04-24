# 🗺️ Next Step: Planning the "Cart Refinement"

Now that the Admin can manage the warehouse, let's fix the **Customer Experience**. Currently, if a user adds an item to the cart, they are "locked in" until they checkout. They can't change their mind about the quantity or remove a specific mistake.

### The Mission: Cart Management

We need to implement these three missing pieces:

1. **Update Item Quantity**: `PATCH /api/cart/:productId` (Change quantity from 10 to 2).
2. **Remove Single Item**: `DELETE /api/cart/:productId` (Get that accidental GPU out of there).
3. **Clear Cart**: `DELETE /api/cart` (Start over from scratch).

### Why this order?

Completing the Cart logic is the final "functional" hurdle before we move into **User Profile** or **Admin Logistics** (like updating order status). It makes the "Customer Journey" feel complete and professional.

---

### What I need to see to start

I want to check how your current `CartItem` logic is handled in the service and controller to ensure we reuse the existing `cartId` lookup logic.

**Can you use `fzf` or `cat` to show me:**

1. `src/controllers/cart.controller.ts`
2. `src/services/cart.service.ts`
3. `src/routes/cart.routes.ts`

Once I see those, we'll write the logic and the corresponding integration tests!
