# NPM ========================================================
./package.json
# TypeScript =================================================
./tsconfig.json
./src/types/express.d.ts
# Vitest =====================================================
./vitest.config.ts
./tests/setup.ts
# Prisma =====================================================
./prisma.config.ts
./prisma/schema.prisma
./prisma/seed.ts
./prisma/seed-first-admin.ts
./src/config/prisma.ts
# Swagger ====================================================
./src/config/swagger.ts

# Entry Point ================================================
./src/app.ts
# Middlewares ================================================
./src/middlewares/error.middleware.ts
./src/middlewares/auth.middleware.ts
./src/middlewares/validate.middleware.ts
./src/middlewares/role.middleware.ts
# Product ====================================================
./src/routes/product.routes.ts
./src/controllers/product.controller.ts
./src/services/product.service.ts
./src/schemas/product.schema.ts
./tests/product.test.ts
# Auth =======================================================
./src/routes/auth.routes.ts
./src/controllers/auth.controller.ts
./src/services/auth.service.ts
./src/schemas/auth.schema.ts
./tests/auth.test.ts
# Cart =======================================================
./src/routes/cart.routes.ts
./src/controllers/cart.controller.ts
./src/services/cart.service.ts
./src/schemas/cart.schema.ts
./tests/cart.test.ts

./src/routes/order.routes.ts
./src/controllers/order.controller.ts
./src/services/order.service.ts
./tests/checkout.test.ts
./tests/orders.test.ts
