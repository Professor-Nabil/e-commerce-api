import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      // Pass Zod errors to our global error handler
      return res
        .status(400)
        .json({ error: { message: error.errors[0].message } });
    }
  };
