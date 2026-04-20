# Project: E-Commerce API

Strategic Implementation Plan - MVP Phase

## Goal Definition

### Core Problem

Building a scalable, secure, and relational backend for a modern e-commerce platform
that handles multiple users, dynamic inventory, and transactional logic.

### MVP Scope (The "Must-Haves")

- **Auth:** User registration and login (JWT).
- **Inventory:** Admin-controlled product CRUD.
- **Shopping:** Public product viewing and private cart management.
- **Checkout:** Simulated payment processing and order creation.

## Technical Strategy

Language: TypeScript
Runtime/Framework: Node.js / Express
Database & ORM: MariaDB + Prisma 6
Validation: Zod
Security: JWT, Bcrypt, CORS
Architecture: Layered (Controller -> Service -> Repository)

## Actionable Roadmap (MoSCoW)

### 1. Must Have (Phase 1 & 2)

- [ ] **Setup:** TypeScript, Prisma Schema, and Express skeleton.
- [ ] **Database Design:** Users, Products, Carts, and Orders tables.
- [ ] **Auth Service:** Hashing passwords and issuing JWTs.
- [ ] **Product Service:** CRUD with Role-Based Access (Admin only).

### 2. Should Have (Phase 3)

- [ ] **Cart Logic:** Logic for quantity updates and stock checking.
- [ ] **Order Service:** Converting cart items into a permanent order record.
- [ ] **Search:** Filtering products by name or category.

### 3. Could Have (Phase 4)

- [ ] **Product Reviews:** User ratings and comments.
- [ ] **Images:** Handling product image URLs (Cloudinary integration).

## Verification Strategy

- **Unit Tests:** Testing business logic (e.g., cart total calculations) using Vitest.
- **Integration Tests:** Testing Prisma queries against a test MariaDB instance.
- **E2E Tests:** Using Supertest to simulate full API requests
  (Login -> Add to Cart -> Checkout).
