import { Request, Response, NextFunction } from "express";
import * as ProductService from "../services/product.service.js";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "newest";

    const filters = {
      q: req.query.q as string,
      categoryId: req.query.categoryId as string,
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
    };

    const result = await ProductService.getAllProducts(
      page,
      limit,
      filters,
      sort,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extract files from Multer (req.files)
    const files = req.files as Express.Multer.File[];
    const filePaths = files?.map((file) => file.path) || [];

    // 2. Prepare the data (Coerce strings to numbers for Prisma)
    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock, 10),
      // Handle categoryNames if sent as form fields
      categoryNames: Array.isArray(req.body.categoryNames)
        ? req.body.categoryNames
        : req.body.categoryNames
          ? [req.body.categoryNames]
          : [],
    };

    // 3. Pass both to the service
    const product = await ProductService.createProduct(productData, filePaths);

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
    // 1. Extract files from Multer
    const files = req.files as Express.Multer.File[];
    const filePaths = files?.map((file) => file.path) || [];

    // 2. Prepare the data (Handle partial updates)
    const updateData = {
      ...req.body,
      // Only parse if the value exists in the request body
      ...(req.body.price && { price: parseFloat(req.body.price) }),
      ...(req.body.stock && { stock: parseInt(req.body.stock, 10) }),

      // Handle categoryNames logic
      ...(req.body.categoryNames && {
        categoryNames: Array.isArray(req.body.categoryNames)
          ? req.body.categoryNames
          : [req.body.categoryNames],
      }),
    };

    // 3. Pass ID, data, and new images to service
    const updated = await ProductService.updateProduct(
      req.params.id,
      updateData,
      filePaths,
    );

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
