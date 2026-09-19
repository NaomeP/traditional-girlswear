import bcrypt from "bcryptjs";
import crypto from "crypto";

import prisma from "../config/prisma";

import type {
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from "../validators/authValidator";

// ==================== REGISTER INPUT ====================

export interface RegisterInput {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

// ==================== REGISTER USER ====================

export async function registerUser(input: RegisterInput) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const mobile = input.mobile.trim();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const existingMobile = await prisma.user.findUnique({
    where: { mobile },
  });

  if (existingMobile) {
    throw new Error(
      "An account with this mobile number already exists",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return await prisma.user.create({
    data: {
      name,
      email,
      mobile,
      passwordHash,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      createdAt: true,
    },
  });
}

// ==================== LOGIN USER ====================

export async function loginUser(input: LoginInput) {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
  };
}

// ==================== UPDATE USER PROFILE ====================

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const mobile = input.mobile.trim();

  const existingEmail = await prisma.user.findFirst({
    where: {
      email: email,
      NOT: {
        id: userId,
      },
    },
  });

  if (existingEmail) {
    throw new Error("This email is already in use");
  }

  const existingMobile = await prisma.user.findFirst({
    where: {
      mobile: mobile,
      NOT: {
        id: userId,
      },
    },
  });

  if (existingMobile) {
    throw new Error("This mobile number is already in use");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: name,
      email: email,
      mobile: mobile,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
    },
  });

  return updatedUser;
}

// ==================== CHANGE USER PASSWORD ====================

export async function changeUserPassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatches = await bcrypt.compare(
    input.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("Current password is incorrect");
  }

  const newPasswordHash = await bcrypt.hash(
    input.newPassword,
    12,
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });
}

// ==================== CREATE PASSWORD RESET TOKEN ====================

export async function createPasswordResetToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000,
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: expiresAt,
    },
  });

  return {
    token: token,
    email: user.email,
  };
}

// ==================== RESET USER PASSWORD ====================

export async function resetUserPassword(
  input: ResetPasswordInput,
): Promise<void> {
  const tokenHash = crypto
    .createHash("sha256")
    .update(input.token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  const newPasswordHash = await bcrypt.hash(
    input.newPassword,
    12,
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: newPasswordHash,
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
    },
  });
  console.log("AUTH SERVICE FILE LOADED");
console.log("updateUserProfile exists:", typeof updateUserProfile);
}