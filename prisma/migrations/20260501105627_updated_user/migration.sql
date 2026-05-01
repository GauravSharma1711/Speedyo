-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('prnding_review', 'not_submitted', 'approved', 'declined');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'prnding_review';
