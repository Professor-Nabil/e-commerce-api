# MVP Minimum Viable Product

---

## 1. The Core Entities (The "Complex Data Model")

You need four main "tables" (or JSON files, though I recommend a database for this). Think about how they connect:

- **Users:** ID, email, password (hashed!), role (admin or customer).
- **Products:** ID, name, description, price, stock quantity.
- **Carts:** Needs to link a `userId` to a list of `products` (including quantities).
- **Orders:** A "snapshot" of a cart once it's paid. It links `userId`, `products`, `totalPrice`, and `status` (pending/paid).

[Image of E-commerce Entity Relationship Diagram]

---

## 2. Breaking Down the Requirements

### A. Authentication (The Security Layer)

In the Task CLI, anyone could run the command. Here, we need **JWT (JSON Web Tokens)**.

- **How it works:** User logs in $\rightarrow$ Server sends a "Secret Passport" (the Token) $\rightarrow$ User sends that passport in the header of every future request.
- **Middleware's Job:** You'll write a middleware that checks this passport before allowing someone to "Add to Cart."

### B. The Roles (Admin vs. Customer)

This is a new concept for you. You need **Authorization**.

- **Admin:** Can CRUD products (Add new laptops, change prices).
- **Customer:** Can only _view_ products and manage _their own_ cart.
- **Your Task:** Create a middleware like `isAdmin` that checks the user's role before allowing access to `POST /api/products`.

### C. The Cart Logic (The "Heavy" Part)

This isn't just a simple array. You have to handle logic like:

- "What if the user adds a product that's already in the cart? (Update quantity, don't duplicate)."
- "What if they try to add 10 items but I only have 5 in stock?"

### D. Payments (External Integration)

As we discussed, **Stripe** is an external API. Your backend will "talk" to Stripe's backend.

1. Your server sends the order total to Stripe.
2. Stripe provides a "Payment Intent."
3. Once the user pays, Stripe sends a signal back to you (a Webhook) to say "It's safe to ship the item!"

---

## 3. Recommended Tech Stack for this Project

Since you are a **Node.js/Express** specialist:

- **Database:** Use **PostgreSQL** with **Prisma**. Why? Because E-commerce data is _relational_. Prisma will make handling the "User-has-many-Orders" logic much easier than JSON files.
- **Auth:** `jsonwebtoken` and `bcryptjs` (for password hashing).
- **Validation:** Use a library like `Zod` or `Joi`. In E-commerce, if a price is sent as a string instead of a number, it can break your whole payment flow.

---

## 4. How to Start (Your "Today" Plan)

Don't try to build the whole diagram at once. Follow this order:

1. **Step 1:** Setup the Express server and a **Product CRUD**. Use Postman to make sure you can add, see, and delete products.
2. **Step 2:** Add **User Registration/Login**. Get the JWT working so you can "Protect" the delete product route.
3. **Step 3:** Build the **Cart logic**. This is where you'll spend the most time on "Business Logic."
4. **Step 4:** Integrate **Stripe** last. It’s the "cherry on top."

---

### One question to get us moving

Do you want to stick with **JSON files** for now to keep it simple, or are you ready to try a **Database (MariaDB/PostgreSQL)** for this project? (A database is much better for e-commerce, but it's a new learning curve!)
