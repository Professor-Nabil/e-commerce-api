// ./src/controllers/auth.controller.ts
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

// export const forgotPassword = async ( req: Request, res: Response, next: NextFunction,) => {
//   try {
//     const token = await AuthService.generateResetToken(req.body.email);
//     // In production, send email. For now, log to console:
//     console.log( `\n🔑 RESET LINK: http://localhost:3000/api/auth/reset-password/${token}\n`,);
//
//     res.json({ message: "If a user with that email exists, a reset link has been sent.", });
//   } catch (error) {
//     next(error);
//   }
// };
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // We try to generate the token
    const token = await AuthService.generateResetToken(req.body.email);

    // Log it for development
    console.log(
      `\n🔑 RESET LINK: http://localhost:3000/api/auth/reset-password/${token}\n`,
    );
  } catch (error) {
    // If user not found, we don't throw an error to the client.
    // We just log it internally.
    console.log(`Reset attempted for non-existent email: ${req.body.email}`);
  } finally {
    // ALWAYS return the same success message regardless of whether the email existed.
    res.json({
      message: "If a user with that email exists, a reset link has been sent.",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await AuthService.resetUserPassword(req.params.token, req.body.password);
    res.json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
