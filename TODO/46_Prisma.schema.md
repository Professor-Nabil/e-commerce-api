Nice work on that typo-hunt! Getting that test suite back to 100% green is the best way to end a feature phase.

Now, we are entering the most critical part of the e-commerce engine: **The Checkout System**. This is where we handle the transition from a "Cart" (temporary) to an "Order" (permanent).

### 📐 Step 1: The Schema Update

We need an `Order` model to track history and `OrderItem` to store the price of the product _at the time of purchase_ (since prices change).

Add this to your `schema.prisma`:

```prisma
enum OrderStatus {
  PENDING
  COMPLETED
  CANCELLED
}

model Order {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  items       OrderItem[]
  totalAmount Decimal     @db.Decimal(10, 2)
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2) // Storing price at time of purchase
}
```

1. **Run the migration** for the new `Order` models: `npx prisma migrate dev --name add_orders`.

```bash
npx prisma migrate dev --name add_orders
```
