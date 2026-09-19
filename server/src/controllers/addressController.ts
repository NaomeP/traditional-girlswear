import { Request, Response } from "express";
import prisma from "../config/prisma";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export async function createAddressController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      fullName,
      mobile,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      isDefault,
    } = req.body;

    if (
      !fullName?.trim() ||
      !mobile?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !postalCode?.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide all required address details",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
      return;
    }

    if (!/^\d{6}$/.test(postalCode.trim())) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit PIN code",
      });
      return;
    }

    const shouldBeDefault =
      Boolean(isDefault) ||
      (await prisma.address.count({
        where: {
          userId: req.user.userId,
        },
      })) === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.userId,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.userId,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim() || null,
        landmark: landmark?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: "India",
        isDefault: shouldBeDefault,
      },
    });

    res.status(201).json({
      success: true,
      message: "Address saved successfully",
      data: address,
    });
  } catch (error) {
    console.error("Failed to create address:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save address",
    });
  }
}

export async function getMyAddressesController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Failed to load addresses:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load addresses",
    });
  }
}

/* UPDATE ADDRESS */

export async function updateAddressController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const addressId = String(req.params.id);

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id: addressId,
          userId: req.user.userId,
        },
      });

    if (!existingAddress) {
      res.status(404).json({
        success: false,
        message: "Address not found",
      });
      return;
    }

    const {
      fullName,
      mobile,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      isDefault,
    } = req.body;

    if (
      !fullName?.trim() ||
      !mobile?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !postalCode?.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide all required address details",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
      return;
    }

    if (!/^\d{6}$/.test(postalCode.trim())) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit PIN code",
      });
      return;
    }

    if (Boolean(isDefault)) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.userId,
          id: {
            not: addressId,
          },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address =
      await prisma.address.update({
        where: {
          id: addressId,
        },
        data: {
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2:
            addressLine2?.trim() || null,
          landmark:
            landmark?.trim() || null,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          isDefault: Boolean(isDefault),
        },
      });

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Failed to update address:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
}

/* SET DEFAULT ADDRESS */

export async function setDefaultAddressController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const addressId = String(req.params.id);

    const address =
      await prisma.address.findFirst({
        where: {
          id: addressId,
          userId: req.user.userId,
        },
      });

    if (!address) {
      res.status(404).json({
        success: false,
        message: "Address not found",
      });
      return;
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          userId: req.user.userId,
        },
        data: {
          isDefault: false,
        },
      }),

      prisma.address.update({
        where: {
          id: addressId,
        },
        data: {
          isDefault: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    console.error(
      "Failed to set default address:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
}

/* DELETE ADDRESS */

export async function deleteAddressController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const addressId = String(req.params.id);

    const address =
      await prisma.address.findFirst({
        where: {
          id: addressId,
          userId: req.user.userId,
        },
      });

    if (!address) {
      res.status(404).json({
        success: false,
        message: "Address not found",
      });
      return;
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    if (address.isDefault) {
      const nextAddress =
        await prisma.address.findFirst({
          where: {
            userId: req.user.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (nextAddress) {
        await prisma.address.update({
          where: {
            id: nextAddress.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete address:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
}