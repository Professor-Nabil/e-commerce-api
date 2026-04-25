import { z } from "zod";

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().positive(),
    stock: z.coerce.number().int().nonnegative(),
    // categoryNames: z.array(z.string()).optional(), // Change from IDs to strings
    // 💡 Fix: Pre-process the input to handle strings or empty values
    categoryNames: z
      .preprocess((val) => {
        if (!val || val === "") return []; // Handle empty string from Swagger
        if (typeof val === "string") return [val]; // Convert single string to array
        return val;
      }, z.array(z.string()))
      .optional(),
  }),
});

export const UpdateProductSchema = z.object({
  body: CreateProductSchema.shape.body.partial(),
});
