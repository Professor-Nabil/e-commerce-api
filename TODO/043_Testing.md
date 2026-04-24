### 🧪 The "Get Cart" Test

Add this test case to your `tests/cart.test.ts`. This will ensure that when a customer fetches their cart, they see the actual product info, not just a bunch of IDs.

```typescript
it("should fetch the user's cart with full product details", async () => {
  // 1. Setup: Use the same customer from the previous test or a new one
  const customer = { email: "get_cart@test.com", password: "password123" };
  await request(app).post("/api/auth/register").send(customer);
  const loginRes = await request(app).post("/api/auth/login").send(customer);
  const token = loginRes.body.token;

  // 2. Add an item first so the cart isn't empty
  // We'll grab the productId from our existing automated product creation if possible,
  // or just create one quickly here.
  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin_cart@test.com", password: "password123" });

  const prod = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${adminLogin.body.token}`)
    .send({
      name: "Monitor",
      description: "4K 27 inch display",
      price: 300,
      stock: 10,
    });

  // 2. Add an item (FIXED TYPO HERE)
  const addToCartRes = await request(app)
    .post("/api/cart")
    .set("Authorization", `Bearer ${token}`) // Space instead of ={
    .send({ productId: prod.body.id, quantity: 1 });

  // Safety check: ensure the item was actually added before we try to fetch the cart
  expect(addToCartRes.statusCode).toEqual(200);

  // 3. The Actual Test: Fetch the cart
  const res = await request(app)
    .get("/api/cart")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toEqual(200);
  expect(res.body.items.length).toBeGreaterThan(0);

  // 4. Verify the "Include" worked (Product details should be nested)
  expect(res.body.items[0].product.name).toBe("Monitor");
  expect(res.body.items[0].product.price).toBeDefined();
});
```
