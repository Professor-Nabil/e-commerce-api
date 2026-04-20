import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newUser = await AuthService.registerUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error); // This goes to our global error handler!
  }
};
