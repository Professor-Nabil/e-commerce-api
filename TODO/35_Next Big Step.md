# 🚀 Next Big Step: The Shopping Cart (Relationships)

Since you mentioned changing IDs to random strings/UUIDs to stop hackers, this is the perfect time to look at your `schema.prisma` for the **Cart** and **CartItems**.

In a real e-commerce app:

- A **User** has one **Cart**.
- A **Cart** has many **CartItems**.
- A **CartItem** points to a **Product**.

**Do you want to update your `schema.prisma` now to use UUIDs for your IDs and add the Cart models?** I can show you how to set up those relations so Prisma handles the "joining" for you.
