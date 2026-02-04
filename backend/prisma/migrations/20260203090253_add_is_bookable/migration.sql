/*
  Warnings:

  - You are about to drop the column `poli_id` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `service_id` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('YES', 'MAYBE', 'NO');

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_poli_id_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "poli_id",
ADD COLUMN     "service_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "schedule" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "is_bookable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "surveys" ADD COLUMN     "department" TEXT,
ADD COLUMN     "recommendation" "RecommendationType",
ADD COLUMN     "respondent_name" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role_id" TEXT;

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_menus" (
    "id" TEXT NOT NULL,
    "role" "UserRole",
    "role_id" TEXT,
    "menus" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "bor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igd_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_menus_role_key" ON "role_menus"("role");

-- CreateIndex
CREATE UNIQUE INDEX "role_menus_role_id_key" ON "role_menus"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_date_key" ON "daily_stats"("date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
