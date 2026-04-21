# 🧪 The Automatic "Get One" Test

To make this automatic, we need to:

1. **Log in** as an Admin (to have permission to create the product).
2. **Create** a product and capture the `id` the database gives back.
3. **Fetch** that specific `id`.

**Update `tests/product.test.ts`**:

```typescript
it("should return a product by its ID", async () => {
  // 1. Get Admin Token
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "password123" });

  const token = loginRes.body.token;

  // 2. Create a product first
  const newProduct = {
    name: "Automatic Test Item",
    description: "This description is long enough for Zod",
    price: 29.99,
    stock: 50,
  };

  const createRes = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${token}`)
    .send(newProduct);

  const createdId = createRes.body.id; // Capture the ID from the response

  // 3. Fetch it by ID
  const res = await request(app).get(`/api/products/${createdId}`);

  // 4. Expect 200 and the correct product name
  expect(res.statusCode).toEqual(200);
  expect(res.body.name).toEqual(newProduct.name);
  expect(res.body.id).toEqual(createdId);
});
```
