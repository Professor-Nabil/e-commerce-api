Sharp eye! You're absolutely right. If you don't mount the router in `app.ts`, your API won't know the `/api/categories` endpoint exists.

While we're at it, let's keep the `app.ts` file clean and organized.

### 🛠️ Update `./src/app.ts`

Add the import and the middleware mounting point:

```ts
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import categoryRoutes from "./routes/category.routes.js"; // 1. Import it
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// 1. TOP MIDDLEWARES
app.use(cors());
app.use(express.json());

// 2. ROUTES
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the E-Commerce API",
    docs: "/api-docs",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes); // 2. Mount it
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// 3. BOTTOM MIDDLEWARE
app.use(errorHandler);

// ... rest of the file
```

---

### 🧪 Verification Checklist

Since you're using a keyboard-driven workflow on Arch, you can quickly verify this with a few `curl` commands once the server is up:

1. **Check Empty Categories:**

    ```bash
    curl http://localhost:3000/api/categories
    ```

    _(Should return `[]`)_

2. **Create a Product with a New Category (Option 2 Logic):**
    Use your Admin JWT to test the "Create or Connect" logic:

    ```bash
    curl -X POST http://localhost:3000/api/products \
      -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Nixie Tube Clock",
        "description": "Retro aesthetic",
        "price": 250.00,
        "stock": 5,
        "categoryNames": ["Electronics", "Vintage"]
      }'
    ```

3. **Verify Categories Auto-Created:**

    ```bash
    curl http://localhost:3000/api/categories
    ```

    _(Should now show "Electronics" and "Vintage")_

---

### 📈 What's next for the Categories?

Now that the "Linking" is done, we should probably update the **Public Discovery** part of your Todo list. Specifically:

- **Filtering**: Updating `GET /api/products` to allow something like `/api/products?category=Electronics`.

Would you like to implement the **Category Filtering** logic in the Product Service now?
