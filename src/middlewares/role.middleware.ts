import { Request, Response, NextFunction } from "express";

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ error: { message: "Unauthorized" } });

    const userRole = req.user.role;

    // 💡 Logic: SUPER_ADMIN bypasses all ADMIN checks
    const hasPermission =
      userRole === "SUPER_ADMIN" || roles.includes(userRole);

    if (!hasPermission) {
      return res.status(403).json({
        error: { message: "Forbidden: You do not have permission" },
      });
    }
    next();
  };
};
