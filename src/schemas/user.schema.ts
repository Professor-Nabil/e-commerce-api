import { z } from "zod";

export const UpdateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional(),
    shippingAddress: z.string().min(5).max(255).optional(),
  }),
});
