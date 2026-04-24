Excellent. Seeing that checkout pass with the stock decrementing to **8** is a huge milestone. You've officially built a transactional system.

To make this test suite truly "production-ready," we should cover the **failure states**. A good developer tests the "Happy Path," but a great developer tests the "Edge Cases."

### 🧪 Refining the Test Suite

Let's add two more tests to `tests/checkout.test.ts` to ensure our error handling works:

1. **Stock Protection:** Prevent checkout if the user asks for more than we have.
2. **Empty Cart Protection:** Prevent checkout if there's nothing to buy.

#### Update `tests/checkout.test.ts`

```typescript
// ... existing test ...

it("should fail checkout if cart is empty", async () => {
  const customer = { email: "empty_cart@test.com", password: "password123" };
  await request(app).post("/api/auth/register").send(customer);
  const login = await request(app).post("/api/auth/login").send(customer);

  const res = await request(app)
    .post("/api/orders/checkout")
    .set("Authorization", `Bearer ${login.body.token}`);

  expect(res.statusCode).toEqual(400);
  expect(res.body.error.message).toBe("Cart is empty");
});

it("should fail checkout if stock is insufficient", async () => {
  // We already have a product 'GPU' from the first test in the same DB
  // but it's safer to create a fresh one with low stock
  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin_checkout@test.com", password: "password123" });

  const prod = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${adminLogin.body.token}`)
    .send({
      name: "Limited Item",
      description: "Only 1 left",
      price: 10,
      stock: 1,
    });

  const customer = { email: "unlucky_buyer@test.com", password: "password123" };
  await request(app).post("/api/auth/register").send(customer);
  const login = await request(app).post("/api/auth/login").send(customer);
  const token = login.body.token;

  // Add 2 to cart when only 1 exists
  await request(app)
    .post("/api/cart")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId: prod.body.id, quantity: 2 });

  const res = await request(app)
    .post("/api/orders/checkout")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toEqual(400);
  expect(res.body.error.message).toContain("Not enough stock");
});
```
