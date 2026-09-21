CREATE TABLE "StoreSettings" (
  "id" TEXT NOT NULL DEFAULT 'store',
  "flatShippingFee" DECIMAL(10,2) NOT NULL DEFAULT 79,
  "freeShippingThreshold" DECIMAL(10,2) NOT NULL DEFAULT 2000,
  "standardDeliveryDays" INTEGER NOT NULL DEFAULT 5,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
INSERT INTO "StoreSettings" ("id", "updatedAt") VALUES ('store', CURRENT_TIMESTAMP) ON CONFLICT ("id") DO NOTHING;
