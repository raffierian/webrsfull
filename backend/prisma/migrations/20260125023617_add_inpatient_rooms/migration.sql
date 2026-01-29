-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('VIP', 'KELAS_1', 'KELAS_2', 'KELAS_3');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');

-- CreateTable
CREATE TABLE "inpatient_rooms" (
    "id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "room_type" "RoomType" NOT NULL,
    "floor" INTEGER NOT NULL,
    "building" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "occupied_beds" INTEGER NOT NULL DEFAULT 0,
    "facilities" JSONB,
    "price_per_day" DECIMAL(10,2) NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "image_url" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inpatient_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inpatient_rooms_room_number_key" ON "inpatient_rooms"("room_number");
