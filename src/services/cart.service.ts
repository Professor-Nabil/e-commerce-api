import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  if (!userId) throw new Error("User ID is required");

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.isDeleted)
    throw new AppError("Product not found", 404);

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const totalRequested = (existingItem?.quantity || 0) + quantity;
  if (product.stock < totalRequested) {
    throw new AppError(
      `Insufficient stock. Only ${product.stock} items available.`,
      400,
    );
  }

  return await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
  });
};

export const getCart = async (userId: string) => {
  return await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
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
  if (!cart) throw new AppError("Cart not found", 404);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404);

  if (product.stock < quantity) {
    throw new AppError(
      `Insufficient stock. Only ${product.stock} items available.`,
      400,
    );
  }

  return await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity },
  });
};

export const removeItem = async (userId: string, productId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError("Cart not found", 404);

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
