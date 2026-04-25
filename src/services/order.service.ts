import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { OrderStatus } from "@prisma/client"; // Import the generated Enum

export const checkout = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the cart and items
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400); // Clean 400
    }

    // 2. Validate stock and calculate total
    let total = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`Not enough stock for ${item.product.name}`, 400);
      }
      total += Number(item.product.price) * item.quantity;
    }

    // 3. Create the Order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: total,
        status: "COMPLETED",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // 4. Update Stock (Atomically)
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 5. Clear the Cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
};

export const getOrderHistory = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              description: true,
              // We don't include current product price here
              // because orderItem.price is the historical price.
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" }, // Newest orders first
  });
};

export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          // name: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Updates an order status.
 * Note: status must be one of: 'PENDING', 'COMPLETED', 'CANCELLED'
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
) => {
  // Check if order exists first to provide a better error message
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);

  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};
