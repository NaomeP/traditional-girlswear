import { Router } from "express";

import {
  loginController,
  registerController,
  logoutController,
  updateProfileController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController";

import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

// Protected routes
router.put("/profile", requireAuth, updateProfileController);
router.put("/change-password", requireAuth, changePasswordController);

export default router;