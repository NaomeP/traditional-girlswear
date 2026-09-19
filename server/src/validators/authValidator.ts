import { z } from "zod";

// ==================== REGISTER ====================

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(100, { error: "Name is too long" }),

  email: z
    .string()
    .trim()
    .email({ error: "Please enter a valid email address" })
    .max(150, { error: "Email is too long" }),

  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, {
      error: "Please enter a valid 10-digit mobile number",
    }),

  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .max(100, { error: "Password is too long" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ==================== LOGIN ====================

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ error: "Please enter a valid email address" })
    .max(150, { error: "Email is too long" }),

  password: z
    .string()
    .min(1, { error: "Password is required" })
    .max(100, { error: "Password is too long" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ==================== UPDATE PROFILE ====================

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(100, { error: "Name is too long" }),

  email: z
    .string()
    .trim()
    .email({ error: "Please enter a valid email address" })
    .max(150, { error: "Email is too long" }),

  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, {
      error: "Please enter a valid 10-digit mobile number",
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ==================== CHANGE PASSWORD ====================

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, {
      error: "Current password is required",
    }),

    newPassword: z
      .string()
      .min(8, {
        error: "New password must be at least 8 characters",
      })
      .max(100, { error: "New password is too long" }),

    confirmPassword: z.string().min(1, {
      error: "Please confirm your password",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>;

// ==================== FORGOT PASSWORD ====================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ error: "Please enter a valid email address" })
    .max(150, { error: "Email is too long" }),
});

export type ForgotPasswordInput = z.infer<
  typeof forgotPasswordSchema
>;

// ==================== RESET PASSWORD ====================

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, {
      error: "Reset token is required",
    }),

    newPassword: z
      .string()
      .min(8, {
        error: "Password must be at least 8 characters",
      })
      .max(100, {
        error: "Password is too long",
      }),

    confirmPassword: z.string().min(1, {
      error: "Please confirm your password",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<
  typeof resetPasswordSchema
>;