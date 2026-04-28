import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import productRoutes from "./routes/product.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import {
  apiLimiter,
  authLimiter,
} from "./middlewares/rate-limit.middleware.js";

const app = express();

// 1. TOP MIDDLEWARES (Config & Parsers)
app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter); // Apply general limit to all /api routes

// 2. ROUTES
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the E-Commerce API",
    docs: "/api-docs",
  });
});

app.use("/uploads", express.static("public/uploads"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/products", productRoutes);
app.use("/api/auth", authLimiter, authRoutes); // Apply strict limit specifically to auth
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// 3. BOTTOM MIDDLEWARE (The Safety Net)
// This MUST be after all routes
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Only start the listener if this file is run directly (not imported by tests)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
  });
}

export default app; // Export for supertest
