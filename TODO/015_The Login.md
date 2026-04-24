# 🔑 Next Step: The Login (Authentication & JWT)

Now that users can register, they need a way to prove who they are later. In modern Web APIs, we don't use sessions; we use **JWT (JSON Web Tokens)**.

When a user logs in, we give them a signed token. They send that token back in the `Authorization` header for every future request (like checking their cart or making an order).

#### 1. Install JWT Tools

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

#### 2. The TDD "Red" Phase

Let's define what a successful login looks like.

**Update `tests/auth.test.ts`**:

```typescript
it("should login an existing user and return a token", async () => {
  // First, ensure a user exists (or use the one from the register test)
  const credentials = { email: "login@test.com", password: "password123" };
  await request(app).post("/api/auth/register").send(credentials);

  const res = await request(app).post("/api/auth/login").send(credentials);

  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty("token"); // We expect a JWT back
});
```

#### 3. Update the Schema

We need a schema for the login request too.

**Update `src/schemas/auth.schema.ts`**:

```typescript
export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(), // No need for min length here, just check if it's there
  }),
});
```

#### 4. The Auth Service (The Verification)

We need to find the user by email and compare the hashed password.

**Update `src/services/auth.service.ts`**:

```typescript
import jwt from "jsonwebtoken";

// ... registerUser ...

export const loginUser = async (credentials: any) => {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password,
  );
  if (!isPasswordValid) throw new Error("Invalid credentials");

  // Sign the token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "1d" },
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
};
```

---

### 🚀 Your Task

1. Add a `JWT_SECRET` to your `.env` and `.env.test`.
2. Create the `login` function in `auth.controller.ts`.
3. Add the route `router.post("/login", validate(LoginSchema), login)` in `auth.routes.ts`.

**Do you want to try writing the Controller logic yourself to see if you can make that test turn Green?** (Hint: It’s very similar to the register controller, just calling `loginUser` instead).
