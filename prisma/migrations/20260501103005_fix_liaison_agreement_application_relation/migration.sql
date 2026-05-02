/*
  Warnings:

  - You are about to drop the column `application_id` on the `photographer_agreements` table. All the data in the column will be lost.
  - Added the required column `photographer_email` to the `photographer_agreements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "liaison_agreements" DROP CONSTRAINT "liaison_agreements_application_id_fkey";

-- DropForeignKey
ALTER TABLE "photographer_agreements" DROP CONSTRAINT "photographer_agreements_application_id_fkey";

-- AlterTable
ALTER TABLE "liaison_applications" ADD COLUMN     "agreement_id" TEXT;

-- AlterTable
ALTER TABLE "photographer_agreements" DROP COLUMN "application_id",
ADD COLUMN     "photographer_email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "photographer_applications" ADD COLUMN     "agreement_id" TEXT;

-- CreateTable
CREATE TABLE "_PhotographerAgreementToPhotographerApplication" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PhotographerAgreementToPhotographerApplication_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PhotographerAgreementToPhotographerApplication_B_index" ON "_PhotographerAgreementToPhotographerApplication"("B");

-- CreateIndex
CREATE INDEX "photographer_applications_agreement_id_idx" ON "photographer_applications"("agreement_id");

-- AddForeignKey
ALTER TABLE "liaison_applications" ADD CONSTRAINT "liaison_applications_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "liaison_agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotographerAgreementToPhotographerApplication" ADD CONSTRAINT "_PhotographerAgreementToPhotographerApplication_A_fkey" FOREIGN KEY ("A") REFERENCES "photographer_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotographerAgreementToPhotographerApplication" ADD CONSTRAINT "_PhotographerAgreementToPhotographerApplication_B_fkey" FOREIGN KEY ("B") REFERENCES "photographer_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
