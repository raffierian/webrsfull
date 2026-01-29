/*
  Warnings:

  - The values [VIP] on the enum `RoomType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoomType_new" AS ENUM ('PAVILIUN_EXECUTIVE', 'PAVILIUN_DELUXE', 'KELAS_1', 'KELAS_2', 'KELAS_3', 'ISOLASI', 'INTENSIF', 'INTENSIF_LAINNYA', 'PERINATOLOGI');
ALTER TABLE "inpatient_rooms" ALTER COLUMN "room_type" TYPE "RoomType_new" USING ("room_type"::text::"RoomType_new");
ALTER TYPE "RoomType" RENAME TO "RoomType_old";
ALTER TYPE "RoomType_new" RENAME TO "RoomType";
DROP TYPE "RoomType_old";
COMMIT;

-- AlterTable
ALTER TABLE "inpatient_rooms" ADD COLUMN     "room_name" TEXT;
