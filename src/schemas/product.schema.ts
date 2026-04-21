import { z } from "zod";

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    // Using coerce.number() helps if numbers come in as strings from some clients
    price: z.coerce.number().positive("Price must be a positive number"),
    stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  }),
});
