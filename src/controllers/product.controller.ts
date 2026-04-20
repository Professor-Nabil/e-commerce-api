import { Request, Response } from "express";
import * as ProductService from "../services/product.service.js";

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
    // res.status(500).json({ error: "Failed to fetch products" });
  }
};
