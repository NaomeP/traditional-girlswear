import { Request, Response } from "express";
import { z } from "zod";

import * as authService from "../services/authService";

import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authValidator";
console.log("forgotPasswordSchema:", forgotPasswordSchema);
console.log(
  "Available authService functions:",
  Object.keys(authService),
);
import { generateAuthToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { sendPasswordResetEmail } from "../services/emailService";

// ==================== UPDATE PROFILE SCHEMA ====================
console.log("forgotPasswordSchema:", forgotPasswordSchema);

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(150, "Email is too long"),

  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
});

// ==================== REGISTER ====================

export async function registerController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const user = await authService.registerUser(validation.data);

    const token = generateAuthToken({
      userId: user.id,
      role: user.role,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. You are now signed in.",
      data: user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Registration failed",
    });
  }
}

// ==================== LOGIN ====================

export async function loginController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid login data",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const user = await authService.loginUser(validation.data);

    const token = generateAuthToken({
      userId: user.id,
      role: user.role,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // The frontend and API are separate Render origins in production.
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
}

// ==================== LOGOUT ====================

export function logoutController(
  _req: Request,
  res: Response,
): void {
  res.clearCookie("auth_token");

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}

// ==================== UPDATE PROFILE ====================

export async function updateProfileController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid profile data",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await authService.updateUserProfile(
      req.user.userId,
      validation.data,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Profile update failed",
    });
  }
}

// ==================== CHANGE PASSWORD ====================

export async function changePasswordController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid password data",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    await authService.changeUserPassword(
      req.user.userId,
      validation.data,
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Password change failed",
    });
  }
}

// ==================== FORGOT PASSWORD ====================

export async function forgotPasswordController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const resetData = await authService.createPasswordResetToken(
      validation.data.email,
    );

    if (resetData) {
      const frontendUrl =
        process.env.FRONTEND_URL || "http://localhost:5173";

      const resetLink =
        `${frontendUrl}/reset-password?token=${encodeURIComponent(
          resetData.token,
        )}`;

      await sendPasswordResetEmail(
        resetData.email,
        resetLink,
      );
    }

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  }
}

// ==================== RESET PASSWORD ====================

export async function resetPasswordController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid password reset data",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    await authService.resetUserPassword(validation.data);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Password reset failed",
    });
  }
}
