CREATE TABLE "ShippingZone" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "postalCodes" TEXT[] NOT NULL,
  "shippingFee" DECIMAL(10,2) NOT NULL,
  "deliveryDays" INTEGER NOT NULL DEFAULT 5,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShippingZone_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ShippingZone_name_key" ON "ShippingZone"("name");
