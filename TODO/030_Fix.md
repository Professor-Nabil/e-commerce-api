**Check your `src/routes/product.routes.ts` specifically for this line:**

```typescript
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  validate(CreateProductSchema),
  createProduct,
);
```

Make sure `validate(CreateProductSchema)` is actually sitting there between the authorization and the controller.
