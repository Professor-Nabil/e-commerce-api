# a comprehensive checklist

- 🛡️ Admin (Back-Office & Logistics)
  - **Product Management**
    - [x] Admin can register & login
    - [x] Create new product (with UUID and Stock)
    - [ ] Update existing product (Price, description, stock)
    - [ ] **Soft Delete** product (Archive system to protect Order History)
    - [ ] Manage Categories (Linking products to specific tags)
    - [ ] Upload Product Images (Cloudinary/S3 integration)
  - **Order Management**
    - [ ] View **all** orders from **all** users (Global Audit)
    - [ ] Update Order Status (`PENDING` → `SHIPPED`)
  - **User Management**
    - [ ] View all registered users
    - [ ] Ban/Deactivate a user account

- 📊 Updated Big Picture (Security Edition)
  - [x] **Secure Registration**: Hardcoded `CUSTOMER` role.
  - [ ] **Admin Seeding**: Manual script to create the first admin.
  - [ ] **Admin Promotion**: `PATCH /api/users/:id/role` (Protected endpoint for Admins only).

- 👤 User (The Customer Experience)
  - **Auth & Profile**
    - [x] Register & Login (JWT)
    - [ ] Update Profile (Shipping Address, Name)
    - [ ] Password Reset flow
  - **Cart & Checkout**
    - [x] View current cart
    - [x] Add item to cart
    - [ ] Update item quantity in cart
    - [ ] Remove specific item from cart
    - [ ] Clear entire cart
    - [x] **Transaction Safety**: Atomic Checkout (Stock decrement + Cart clear)
  - **Order History**
    - [x] View order history list
    - [x] View historical price (Price at time of purchase)
    - [ ] View details of a specific past order by ID

- 🌐 Anyone (Public Discovery)
  - **Product Access**
    - [x] View all products
    - [x] View product by ID
  - **Discovery Optimization**
    - [ ] **Pagination**: (Essential for your Arch/Terminal performance too!)
    - [ ] **Filtering**: By category or price
    - [ ] **Searching**: Keyword search (`/products?q=keyboard`)
    - [ ] **Sorting**: (Price: High/Low, Newest)

- ⚙️ System & Technical (The "Invisible" Quality)
  - **Documentation**
    - [x] Swagger/OpenAPI spec (Fully implemented for existing routes)
  - **Testing (TDD)**
    - [x] Unit/Integration tests for Auth
    - [x] Unit/Integration tests for Cart/Checkout
    - [ ] Unit/Integration tests for Admin routes
  - **Safety & Performance**
    - [ ] **Rate Limiting**: (Protecting your login from brute force)
    - [ ] **Logging**: (Tracking errors in production)
    - [x] **Environment Management**: (Separation of `ecommerce_db` and `ecommerce_test_db`)
