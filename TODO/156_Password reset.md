Starting a new session! Password reset is a critical flow that involves security, time-sensitive tokens, and background processes (emails). Since we don't have a real SMTP server set up in your local Arch environment yet, we'll build the logic to generate tokens and we can "mock" the email sending by logging the URL to the terminal for now.

Here is the plan for the **Password Reset Flow**:

---

## 🛠️ 1. Update the Schema (`prisma/schema.prisma`)

We need a way to store a reset token and its expiration date on the `User` model.

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  // --- Password Reset Fields ---
  resetToken        String?   @unique
  resetTokenExpires DateTime?
  // -----------------------------
  role              Role      @default(CUSTOMER)
  status            UserStatus @default(ACTIVE)
  // ... rest of your model
}
```

**Action:** Run the migration:

```bash
npx prisma migrate dev --name add_password_reset_fields
```

---

## 🔒 2. The Logic Strategy

We need two main endpoints:

1. **`POST /api/auth/forgot-password`**: Generates a random token, hashes it, saves it to the DB, and "sends" the link.
2. **`POST /api/auth/reset-password/:token`**: Validates the token, checks expiry, and updates the password.

---

## 🧪 3. The Validation Schema (`src/schemas/auth.schema.ts`)

Add these to your auth schemas:

```ts
export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const ResetPasswordSchema = z.object({
  params: z.object({
    token: z.string(),
  }),
  body: z.object({
    password: z.string().min(8),
  }),
});
```

---

## ⚙️ 4. The Service Layer (`src/services/auth.service.ts`)

We’ll use the native `crypto` module to generate secure, unguessable tokens.

```ts
import crypto from "crypto";

export const generateResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("No user found with that email", 404);

  // 1. Create a plain-text token to send to user
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash the token to store in DB (Security best practice)
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Set expiry (e.g., 10 minutes)
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return resetToken; // Return the UNHASHED version to send via "email"
};

export const resetUserPassword = async (token: string, newPassword: any) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpires: { gt: new Date() }, // Check if not expired
    },
  });

  if (!user) throw new AppError("Token is invalid or has expired", 400);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });
};
```

---

## 🎮 5. The Controller (`src/controllers/auth.controller.ts`)

```ts
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = await AuthService.generateResetToken(req.body.email);

    // In production, send email. For now, log to console:
    console.log(
      `\n🔑 RESET LINK: http://localhost:3000/api/auth/reset-password/${token}\n`,
    );

    res.json({
      message: "If a user with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await AuthService.resetUserPassword(req.params.token, req.body.password);
    res.json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🛣️ 6. The Routes (`src/routes/auth.routes.ts`)

```ts
router.post("/forgot-password", validate(ForgotPasswordSchema), forgotPassword);
router.post(
  "/reset-password/:token",
  validate(ResetPasswordSchema),
  resetPassword,
);
```

### 🧠 A Note on Security

We hash the token in the database. Why? Because if your database is ever leaked, an attacker can't use the tokens to take over accounts. They would need the original plain-text token that was "emailed" to the user.

**Ready to implement this?** I can help you write the full integration test to verify the token expires correctly and that the password actually changes.
