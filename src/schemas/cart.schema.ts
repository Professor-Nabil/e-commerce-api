import { z } from "zod";

export const AddToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  }),
});
