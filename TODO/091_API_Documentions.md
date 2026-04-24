To keep our documentation in sync, we need to add the **Update Item**, **Remove Item**, and **Clear Cart** endpoints to the `/api/cart` section of the Swagger spec.

Add these blocks inside the `paths` object in your `./src/config/swagger.ts`.

### 📝 `./src/config/swagger.ts` Update

```ts
    // --- CART ENDPOINTS ---
    "/api/cart": {
      // ... (keep existing get/post)
      delete: {
        tags: ["Cart"],
        security: [{ bearerAuth: [] }],
        summary: "Clear all items from the cart",
        responses: {
          204: { description: "Cart cleared successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/cart/{productId}": {
      patch: {
        tags: ["Cart"],
        security: [{ bearerAuth: [] }],
        summary: "Update quantity of a specific item in the cart",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: {
                  quantity: { type: "integer", minimum: 1, example: 5 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Quantity updated" },
          400: { description: "Validation error" },
          404: { description: "Item not found in cart" },
        },
      },
      delete: {
        tags: ["Cart"],
        security: [{ bearerAuth: [] }],
        summary: "Remove a specific item from the cart",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: { description: "Item removed successfully" },
          404: { description: "Item not found in cart" },
        },
      },
    },
```

---

### 🧱 Structural Check

With these changes, your API structure now follows standard REST patterns:

- **Collections** (`/api/cart`) use `GET` to list and `POST` to add.
- **Specific Resources** (`/api/cart/{id}`) use `PATCH` for updates and `DELETE` for removal.

### 💾 Time to Commit

Once you've saved the routes (with the middleware we discussed) and the Swagger updates, you are ready for the final sweep.

```bash
git add .
git commit -m "feat(cart): implement quantity updates, removal, clear cart, and sync documentation"
```

Everything looks solid, Nabil. The tests are green, the code is validated, and the docs are updated. Since we just finished the Cart, do you want to handle **Stock Validation** next (making sure customers can't buy more than what's in `Product.stock`)?

How does the `mvp` branch look to you right now?
