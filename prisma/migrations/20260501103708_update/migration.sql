/*
  Warnings:

  - You are about to drop the column `agreement_id` on the `liaison_applications` table. All the data in the column will be lost.
  - You are about to drop the column `agreement_id` on the `photographer_applications` table. All the data in the column will be lost.
  - You are about to drop the `_PhotographerAgreementToPhotographerApplication` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PhotographerAgreementToPhotographerApplication" DROP CONSTRAINT "_PhotographerAgreementToPhotographerApplication_A_fkey";

-- DropForeignKey
ALTER TABLE "_PhotographerAgreementToPhotographerApplication" DROP CONSTRAINT "_PhotographerAgreementToPhotographerApplication_B_fkey";

-- DropForeignKey
ALTER TABLE "liaison_applications" DROP CONSTRAINT "liaison_applications_agreement_id_fkey";

-- DropIndex
DROP INDEX "photographer_applications_agreement_id_idx";

-- AlterTable
ALTER TABLE "liaison_applications" DROP COLUMN "agreement_id";

-- AlterTable
ALTER TABLE "photographer_agreements" ADD COLUMN     "application_id" TEXT;

-- AlterTable
ALTER TABLE "photographer_applications" DROP COLUMN "agreement_id";

-- DropTable
DROP TABLE "_PhotographerAgreementToPhotographerApplication";

-- AddForeignKey
ALTER TABLE "liaison_agreements" ADD CONSTRAINT "liaison_agreements_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "liaison_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photographer_agreements" ADD CONSTRAINT "photographer_agreements_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "photographer_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
