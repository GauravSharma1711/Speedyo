-- AlterTable
ALTER TABLE "test_drive_requests" ADD COLUMN     "location" TEXT;

-- CreateTable
CREATE TABLE "test_drive_reports" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "test_drive_request_id" TEXT NOT NULL,
    "buyer_interest_level" TEXT NOT NULL,
    "buyer_feedback" TEXT,
    "speedio_assessment" TEXT NOT NULL,
    "recommended_next_steps" TEXT,
    "admin_notes" TEXT,

    CONSTRAINT "test_drive_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_drive_reports_test_drive_request_id_key" ON "test_drive_reports"("test_drive_request_id");

-- AddForeignKey
ALTER TABLE "test_drive_reports" ADD CONSTRAINT "test_drive_reports_test_drive_request_id_fkey" FOREIGN KEY ("test_drive_request_id") REFERENCES "test_drive_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
