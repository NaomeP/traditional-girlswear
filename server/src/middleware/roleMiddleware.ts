import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authMiddleware";

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const role = req.user?.role;

  if (
    role !== "ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });

    return;
  }

  next();
}