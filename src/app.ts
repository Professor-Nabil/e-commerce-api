import express from "express";
import cors from "cors"; // 1. Import CORS
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { getProducts } from "./controllers/product.controller.js";

const app = express();

// Middlewares
app.use(cors()); // 2. Enable CORS
app.use(express.json());

// 3. Simple Home Route
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the E-Commerce API",
    docs: "/api-docs",
  });
});

// Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.get("/api/products", getProducts);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📑 Docs:   http://localhost:${PORT}/api-docs`);
});
