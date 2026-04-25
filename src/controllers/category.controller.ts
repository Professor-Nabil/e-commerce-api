import { Request, Response, NextFunction } from "express";
import * as CategoryService from "../services/category.service.js";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// Useful for pre-seeding categories
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    const category = await CategoryService.createCategory(name);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};
