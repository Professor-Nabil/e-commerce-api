import { Request, Response, NextFunction } from "express";
import * as CartService from "../services/cart.service.js";

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user!.id; // req.user is set by authenticate middleware

    const cartItem = await CartService.addToCart(userId, productId, quantity);
    res.status(200).json(cartItem);
  } catch (error) {
    next(error);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const cart = await CartService.getCart(userId);

    if (!cart) {
      return res.json({ items: [] }); // Return empty items if no cart exists yet
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};
