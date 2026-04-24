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
