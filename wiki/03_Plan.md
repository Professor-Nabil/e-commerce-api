@page { size: A4; margin: 15mm 12mm; background-color: #f8fafc; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; } .header-banner { background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 20px; } h1 { margin: 0; font-size: 22pt; } h2 { color: #334155; border-left: 5px solid #3b82f6; padding-left: 10px; font-size: 16pt; margin-top: 25px; } h3 { color: #475569; font-size: 13pt; margin-top: 15px; } .section { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; } ul { padding-left: 20px; } li { margin-bottom: 8px; } .tech-grid { display: table; width: 100%; border-collapse: collapse; } .tech-item { display: table-row; border-bottom: 1px solid #e2e8f0; } .tech-label { font-weight: bold; padding: 8px; width: 30%; } .tech-value { padding: 8px; } .todo-box { border: 1px solid #cbd5e1; padding: 10px; background-color: #f1f5f9; font-family: monospace; font-size: 10pt; }

# Project: E-Commerce API

Strategic Implementation Plan - MVP Phase

## Goal Definition

### Core Problem

Building a scalable, secure, and relational backend for a modern e-commerce platform that handles multiple users, dynamic inventory, and transactional logic.

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

### 1\. Must Have (Phase 1 & 2)

- \[ \] **Setup:** TypeScript, Prisma Schema, and Express skeleton.
- \[ \] **Database Design:** Users, Products, Carts, and Orders tables.
- \[ \] **Auth Service:** Hashing passwords and issuing JWTs.
- \[ \] **Product Service:** CRUD with Role-Based Access (Admin only).

### 2\. Should Have (Phase 3)

- \[ \] **Cart Logic:** Logic for quantity updates and stock checking.
- \[ \] **Order Service:** Converting cart items into a permanent order record.
- \[ \] **Search:** Filtering products by name or category.

### 3\. Could Have (Phase 4)

- \[ \] **Product Reviews:** User ratings and comments.
- \[ \] **Images:** Handling product image URLs (Cloudinary integration).

## Verification Strategy

- **Unit Tests:** Testing business logic (e.g., cart total calculations) using Vitest.
- **Integration Tests:** Testing Prisma queries against a test MariaDB instance.
- **E2E Tests:** Using Supertest to simulate full API requests (Login -> Add to Cart -> Checkout).
