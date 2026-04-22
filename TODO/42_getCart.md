# **The "Get Cart" Route (`GET /api/cart`)**

Right now, you can add things to the cart, but the customer can't _see_ their cart. In a real app, they need to see the product names and prices, not just the IDs.

#### 1. The Service (Using Prisma `include`)

This is where Prisma shines. We can fetch the cart and "join" the product details in one go.

**Add to `src/services/cart.service.ts`:**

```typescript
export const getCart = async (userId: string) => {
  return await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true, // This joins the Product table to give us names/prices
        },
      },
    },
  });
};
```

#### 2. The Controller

**Add to `src/controllers/cart.controller.ts`:**

```typescript
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const cart = await CartService.getCart(userId);

    if (!cart) {
      return res.json({ items: [] }); // Return empty items if no cart exists yet
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};
```

#### 3. The Route

**Add to `src/routes/cart.routes.ts`:**

```typescript
router.get("/", authenticate, getCart);
```
