import { Request, Response, NextFunction } from "express";
import * as OrderService from "../services/order.service.js";

export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const order = await OrderService.checkout(userId);
    res.status(201).json(order);
  } catch (error: any) {
    // If it's a validation error (stock/empty cart), send 400
    if (error.message === "Cart is empty" || error.message.includes("stock")) {
      return res.status(400).json({ error: { message: error.message } });
    }
    next(error);
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
