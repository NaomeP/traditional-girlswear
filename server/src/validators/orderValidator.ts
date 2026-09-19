
import { z } from "zod";

export const createOrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),

  addressId: z.string().min(1, "Address ID is required"),

  paymentMethod: z.enum(["ONLINE", "COD"]),

  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Variant ID is required"),
        quantity: z
          .number()
          .int()
          .positive()
          .max(20),
      }),
    )
    .min(1, "At least one product is required"),

  couponCode: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;

