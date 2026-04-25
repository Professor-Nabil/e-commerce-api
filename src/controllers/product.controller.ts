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

// export const createProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const product = await ProductService.createProduct(req.body);
//     res.status(201).json(product);
//   } catch (error) {
//     next(error);
//   }
// };
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

// export const updateProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const updated = await ProductService.updateProduct(req.params.id, req.body);
//     res.json(updated);
//   } catch (error) {
//     next(error);
//   }
// };
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
