-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'FAILED';
ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';

-- CreateTable
CREATE TABLE "hospital_settings" (
    "id" TEXT NOT NULL,
    "default_consultation_fee" DECIMAL(10,2) NOT NULL DEFAULT 50000,
    "bank_name" TEXT NOT NULL DEFAULT 'BCA',
    "bank_account_number" TEXT NOT NULL DEFAULT '1234567890',
    "bank_account_name" TEXT NOT NULL DEFAULT 'RS Soewandhie',
    "midtrans_server_key" TEXT,
    "midtrans_client_key" TEXT,
    "midtrans_is_production" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_settings_pkey" PRIMARY KEY ("id")
);
