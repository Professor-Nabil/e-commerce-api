import { Request, Response, NextFunction } from "express";
import * as OrderService from "../services/order.service.js";
import { OrderStatus } from "@prisma/client";
import { AppError } from "../utils/appError.js";

export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const order = await OrderService.checkout(userId);
    res.status(201).json(order);
  } catch (error) {
    next(error); // Just pass it along!
  }
};

export const getOrderHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const orders = await OrderService.getOrderHistory(userId);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Basic validation before hitting service
    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw new AppError(
        `Invalid status. Use: ${Object.values(OrderStatus).join(", ")}`,
        400,
      );
    }

    const updatedOrder = await OrderService.updateOrderStatus(
      id,
      status as OrderStatus,
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};
