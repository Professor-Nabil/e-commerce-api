import { z } from "zod";

export const AddToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  }),
});

// New schema for updates
export const UpdateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive(),
  }),
});
