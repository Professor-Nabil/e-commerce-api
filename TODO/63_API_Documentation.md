You are absolutely right. The order history endpoint is a key part of the user journey, and it needs to be explicitly documented so users can actually see those snapshots of their past purchases.

Since your service logic for `getOrderHistory` uses that clean nested Prisma include (Order → Items → Product), our Swagger definition should reflect that structure clearly.

### 🛠️ Final Piece: Adding Order History to `swagger.ts`

Add this block inside your `paths` object, right alongside the checkout endpoint:

```typescript
    // ... inside paths ...
    "/api/orders": {
      get: {
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        summary: "Get current user's order history",
        description: "Returns all orders placed by the authenticated user, including items and product names.",
        responses: {
          200: {
            description: "A list of past orders",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
          401: { description: "Unauthorized - Valid JWT required" },
        },
      },
    },
```

---

### 🔍 Quality Check

Now that everything is mapped out, your Swagger UI will act as a complete control panel for the API:

- **Authentication**: Register/Login to get a token.
- **Products**: Browse the catalog or manage it as an Admin.
- **Cart**: Build up a list of items.
- **Orders**: Execute the transaction and immediately verify the results in your history.

**Great catch on that missing route!** Your documentation is now as solid as your test suite. Go ahead and commit—you've earned that wrap-up.
