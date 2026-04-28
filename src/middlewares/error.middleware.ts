// ./src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // 1. Determine status code (Check statusCode first, then status, then default 500)
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  // 2. Log the error using Winston
  // We log the method, path, and stack trace for debugging
  logger.error({
    message: message,
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    stack: err.stack,
  });

  // 3. Send response
  res.status(statusCode).json({
    error: {
      message: message,
    },
  });
};
