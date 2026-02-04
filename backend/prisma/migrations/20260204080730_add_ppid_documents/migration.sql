/*
  Warnings:

  - You are about to drop the column `category` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `excerpt` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `published_at` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `articles` table. All the data in the column will be lost.
  - The `tags` column on the `articles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `complaint` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `consultation_date` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `ratings` on the `surveys` table. All the data in the column will be lost.
  - The `service_type` column on the `surveys` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[ticket_code]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appointment_id]` on the table `consultations` will be added. If there are existing duplicate values, this will fail.
  - Made the column `service_id` on table `appointments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `appointment_id` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Made the column `diagnosis` on table `consultations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `rating` to the `surveys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "ticket_code" TEXT,
ALTER COLUMN "service_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "category",
DROP COLUMN "excerpt",
DROP COLUMN "image_url",
DROP COLUMN "published_at",
DROP COLUMN "views",
ADD COLUMN     "thumbnail_url" TEXT,
DROP COLUMN "tags",
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "consultations" DROP COLUMN "complaint",
DROP COLUMN "consultation_date",
ADD COLUMN     "appointment_id" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'COMPLETED',
ALTER COLUMN "diagnosis" SET NOT NULL,
ALTER COLUMN "prescription" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "surveys" DROP COLUMN "comments",
DROP COLUMN "ratings",
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "rating" INTEGER NOT NULL,
DROP COLUMN "service_type",
ADD COLUMN     "service_type" "ServiceType";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_login" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_ticket_code_key" ON "appointments"("ticket_code");

-- CreateIndex
CREATE UNIQUE INDEX "consultations_appointment_id_key" ON "consultations"("appointment_id");

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
