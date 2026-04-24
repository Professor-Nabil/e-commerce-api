Great idea. Extracting that repetitive logic into a helper is exactly what you should do to keep your codebase **DRY** (Don't Repeat Yourself). It also makes your integration tests much more readable because they can focus on the _API behavior_ rather than database setup.

Since we are using **Arch** and a **PDE** (Personal Development Environment), you probably want these helpers to be as lean as possible.

### 🛠️ 1. Create the Helper: `./tests/helpers/auth.helper.ts`

We’ll wrap the manual injection and the login request into one clean function.

```ts
import { prisma } from "../../src/config/prisma.js";
import bcrypt from "bcrypt";
import request from "supertest";
import app from "../../src/app.js";

export const getAdminToken = async (
  email = "admin@test.com",
  password = "password123",
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Ensure Admin exists in DB
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2. Login to get the token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};

export const getCustomerToken = async (
  email = "customer@test.com",
  password = "password123",
) => {
  // Use public API for customer to ensure registration logic works
  await request(app).post("/api/auth/register").send({ email, password });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};
```

---

### 🧪 2. Refactor: `./tests/integration/products/product.test.ts`

Notice how much shorter the `beforeAll` becomes. I've also updated the import to match your new folder structure (`../../src/app.js`).

```ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { getAdminToken, getCustomerToken } from "../../helpers/auth.helper.js";

describe("Product Management Integration", () => {
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    adminToken = await getAdminToken("admin_prod@test.com");
    customerToken = await getCustomerToken("regular_user@test.com");
  });

  describe("Product Protection & Roles", () => {
    it("should return 403 if a CUSTOMER tries to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Illegal Product",
          description: "Unauthorized creation attempt",
          price: 100,
          stock: 10,
        });
      expect(res.statusCode).toEqual(403);
    });

    it("should allow an ADMIN to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Mechanical Keyboard",
          description: "A very clicky and tactile keyboard",
          price: 150,
          stock: 10,
        });
      expect(res.statusCode).toEqual(201);
    });
  });

  // ... (Validation and Retrieval tests stay the same, using adminToken)
});
```

---

### 📂 Updated File Structure

With your plan to separate integration tests into subfolders, your `tests` directory now looks like a professional enterprise setup:

```bash
tests/
├── e2e/
│   └── checkout.test.ts
├── helpers/
│   └── auth.helper.ts
├── integration/
│   ├── auth/
│   │   └── auth.test.ts
│   ├── products/
│   │   └── product.test.ts
│   ├── cart/
│   │   └── cart.test.ts
│   └── orders/
│       └── orders.test.ts
├── unit/
└── setup.ts
```

### 💡 Why this is better

- **Encapsulation**: If you ever change how JWTs are generated or how roles are assigned, you only update `auth.helper.ts`, not 15 different test files.
- **Readability**: Your test files now describe _what_ is being tested, not _how_ to set up the database.
- **Scalability**: Since you're moving integration tests into subfolders (like `/products/`), you can easily add `categories.test.ts` or `reviews.test.ts` later without cluttering the root.

How does this look in your terminal? If you're happy with this setup, you can go ahead and migrate the other integration tests to use these helpers!
