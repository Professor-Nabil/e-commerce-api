import { Request, Response, NextFunction } from "express";
import * as ProductService from "../services/product.service.js";

export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    // res.status(500).json({ error: "Internal Server Error" });
    // res.status(500).json({ error: "Failed to fetch products" });
    // This sends the error to your errorHandler middleware!
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: { message: "Product not found" } });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await ProductService.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await ProductService.softDeleteProduct(req.params.id);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
};
