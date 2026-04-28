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
./tests/integration/products/product.test.ts
./tests/integration/products/admin-product.test.ts
# Auth =======================================================
./src/routes/auth.routes.ts
./src/controllers/auth.controller.ts
./src/services/auth.service.ts
./src/schemas/auth.schema.ts
./tests/integration/auth/auth.test.ts
./tests/integration/auth/password-reset.test.ts
# Cart =======================================================
./src/routes/cart.routes.ts
./src/controllers/cart.controller.ts
./src/services/cart.service.ts
./src/schemas/cart.schema.ts
./tests/integration/cart/cart.test.ts
./tests/integration/cart/cart-management.test.ts
./tests/integration/cart/stock-validation.test.ts
# Order ======================================================
./src/routes/order.routes.ts
./src/controllers/order.controller.ts
./src/services/order.service.ts
./tests/e2e/checkout.test.ts
./tests/integration/orders/orders.test.ts
./tests/integration/orders/admin-order.test.ts
./tests/integration/orders/order-details.test.ts

# Category ===================================================
./src/routes/category.routes.ts
./src/controllers/category.controller.ts
./src/services/category.service.ts
./tests/integration/products/categories.test.ts

# User =======================================================
./src/routes/user.routes.ts
./src/controllers/user.controller.ts
./src/services/user.service.ts
./src/schemas/user.schema.ts
./tests/integration/users/user.test.ts
./tests/integration/users/profile.test.ts

# More =======================================================

./tests/helpers/auth.helper.ts

./src/utils/appError.ts

./public/uploads/
./src/config/multer.ts
