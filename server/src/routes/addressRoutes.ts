import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware";

import {
  createAddressController,
  getMyAddressesController,
  updateAddressController,
  setDefaultAddressController,
  deleteAddressController,
} from "../controllers/addressController";

const router = Router();

router.get(
  "/",
  requireAuth,
  getMyAddressesController,
);

router.post(
  "/",
  requireAuth,
  createAddressController,
);

router.put(
  "/:id",
  requireAuth,
  updateAddressController,
);

router.patch(
  "/:id/default",
  requireAuth,
  setDefaultAddressController,
);

router.delete(
  "/:id",
  requireAuth,
  deleteAddressController,
);

export default router;