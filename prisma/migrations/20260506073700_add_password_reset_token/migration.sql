-- Add password reset token fields (separate from verificationCode OTP)
ALTER TABLE "users"
ADD COLUMN "passwordResetTokenHash" TEXT,
ADD COLUMN "passwordResetTokenExpiry" TIMESTAMP(3);

