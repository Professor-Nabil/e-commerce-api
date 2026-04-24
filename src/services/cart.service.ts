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

export const getCart = async (userId: string) => {
  return await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true, // This joins the Product table to give us names/prices
        },
      },
    },
  });
};

export const updateQuantity = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new Error("Cart not found");

  return await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity },
  });
};

export const removeItem = async (userId: string, productId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new Error("Cart not found");

  return await prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  return await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
};
