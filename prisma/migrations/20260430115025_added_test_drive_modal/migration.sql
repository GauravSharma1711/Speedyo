/*
  Warnings:

  - You are about to drop the column `test_drive_details` on the `messages` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TestDriveStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled');

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "test_drive_details";

-- CreateTable
CREATE TABLE "test_drive_requests" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "requester_name" TEXT NOT NULL,
    "requester_email" TEXT NOT NULL,
    "requester_phone" TEXT,
    "requested_date" TEXT NOT NULL,
    "requested_time" TEXT NOT NULL,
    "confirmed_date" TEXT,
    "confirmed_time" TEXT,
    "status" "TestDriveStatus" NOT NULL DEFAULT 'pending',
    "additional_notes" TEXT,
    "cancellation_reason" TEXT,
    "seller_notes" TEXT,
    "user_id" TEXT,

    CONSTRAINT "test_drive_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_drive_requests_vehicle_id_idx" ON "test_drive_requests"("vehicle_id");

-- CreateIndex
CREATE INDEX "test_drive_requests_user_id_idx" ON "test_drive_requests"("user_id");

-- CreateIndex
CREATE INDEX "test_drive_requests_status_idx" ON "test_drive_requests"("status");

-- AddForeignKey
ALTER TABLE "test_drive_requests" ADD CONSTRAINT "test_drive_requests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_drive_requests" ADD CONSTRAINT "test_drive_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
