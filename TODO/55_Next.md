### 🏁 What's the Final Step for the MVP?

You now have a fully functional e-commerce flow! The last thing a real API needs is **Order History**.

Right now, a user can buy things, but they can't see what they bought.
**Should we add a `GET /api/orders` route to see past orders before we wrap up this phase?** This would use Prisma to fetch all orders for the `userId` and include the `items` and `product` names.
