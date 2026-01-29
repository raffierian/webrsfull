/*
  Warnings:

  - A unique constraint covering the columns `[nik]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('LEAFLET', 'POSTER', 'VIDEO', 'BOOKLET', 'OTHER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "nik" TEXT,
ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expires" TIMESTAMP(3),
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" TEXT;

-- CreateTable
CREATE TABLE "health_promos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_promos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariffs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price_1" DECIMAL(12,2),
    "price_2" DECIMAL(12,2),
    "price_3" DECIMAL(12,2),
    "price_vip" DECIMAL(12,2),
    "price_flat" DECIMAL(12,2),
    "is_flat" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");
