import { prisma } from "../config/prisma.js";

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  if (!userId) {
    throw new Error("User ID is required to add items to cart");
  }
  // 1. Ensure the user has a cart
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // 2. Upsert the CartItem
  return await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });
};
