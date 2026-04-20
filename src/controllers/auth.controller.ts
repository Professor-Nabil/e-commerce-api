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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AuthService.loginUser(req.body);
    // result contains { token, user }
    res.status(200).json(result);
  } catch (error: any) {
    // If AuthService throws "Invalid credentials", this catches it
    if (error.message === "Invalid credentials") {
      return res
        .status(401)
        .json({ error: { message: "Invalid email or password" } });
    }
    next(error);
  }
};
