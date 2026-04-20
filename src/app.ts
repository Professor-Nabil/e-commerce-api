import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import productRoutes from "./routes/product.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// 1. TOP MIDDLEWARES (Config & Parsers)
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
app.use("/api/products", productRoutes);

// 3. BOTTOM MIDDLEWARE (The Safety Net)
// This MUST be after all routes
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📑 Docs:   http://localhost:${PORT}/api-docs`);
});
