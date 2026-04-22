import { prisma } from "../config/prisma.js";

export const checkout = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the cart and items
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // 2. Validate stock and calculate total
    let total = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name}`);
      }
      total += Number(item.product.price) * item.quantity;
    }

    // 3. Create the Order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: total,
        status: "COMPLETED", // For MVP, we'll assume payment is instant
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // 4. Update Stock
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
