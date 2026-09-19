import type {
  NextFunction,
  Request as ExpressRequest,
  Response,
} from "express";

import { verifyAuthToken } from "../utils/jwt";

export interface AuthenticatedRequest extends ExpressRequest {
  // Explicitly retain the Express request fields when compiling under the
  // Node 24 / TypeScript resolver used by Render.
  body: any;
  params: any;
  query: any;
  cookies: any;
  user?: {
    userId: string;
    role: string;
  };
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const payload = verifyAuthToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error("Authentication failed:", error);

    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication",
    });
  }
}
