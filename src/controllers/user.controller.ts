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

export const toggleUserBan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting { "status": "BANNED" }

    const updatedUser = await UserService.updateUserStatus(id, status);
    res.json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // Expecting { "role": "ADMIN" }

    if (!["ADMIN", "CUSTOMER"].includes(role)) {
      return res
        .status(400)
        .json({ error: { message: "Invalid role provided" } });
    }

    const updatedUser = await UserService.updateUserRole(id, role);
    res.json({
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
