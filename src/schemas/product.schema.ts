import { z } from "zod";

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().positive(),
    stock: z.coerce.number().int().nonnegative(),
  }),
});

export const UpdateProductSchema = z.object({
  body: CreateProductSchema.shape.body.partial(),
});
