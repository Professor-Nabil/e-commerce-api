import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/user.service.js";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UserService.getAllUsers(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
