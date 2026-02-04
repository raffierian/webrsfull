/*
  Rewritten Idempotent Migration
  Safe for Remote Deploy on Partially Updated DB
*/

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RecommendationType') THEN
        CREATE TYPE "RecommendationType" AS ENUM ('YES', 'MAYBE', 'NO');
    END IF;
END $$;

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_poli_id_fkey";

-- AlterTable appointments
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "poli_id";
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "service_id" TEXT; -- Relaxed constraint for safety

-- AlterTable doctors
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "schedule" TEXT;

-- AlterTable services
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "is_bookable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable surveys
ALTER TABLE "surveys" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "surveys" ADD COLUMN IF NOT EXISTS "recommendation" "RecommendationType";
ALTER TABLE "surveys" ADD COLUMN IF NOT EXISTS "respondent_name" TEXT;

-- AlterTable users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role_id" TEXT;

-- CreateTable roles
CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable role_menus
CREATE TABLE IF NOT EXISTS "role_menus" (
    "id" TEXT NOT NULL,
    "role" "UserRole",
    "role_id" TEXT,
    "menus" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "role_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable daily_stats
CREATE TABLE IF NOT EXISTS "daily_stats" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "bor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igd_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "role_menus_role_key" ON "role_menus"("role");
CREATE UNIQUE INDEX IF NOT EXISTS "role_menus_role_id_key" ON "role_menus"("role_id");
CREATE UNIQUE INDEX IF NOT EXISTS "daily_stats_date_key" ON "daily_stats"("date");

-- AddForeignKey (Robust Checks)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_id_fkey') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_service_id_fkey') THEN
        ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'role_menus_role_id_fkey') THEN
        ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
