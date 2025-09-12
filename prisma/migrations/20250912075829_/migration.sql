/*
  Warnings:

  - You are about to drop the column `endTime` on the `PriceSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `PriceSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."PriceSlot_courtId_startTime_key";

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "stripeSessionUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."PriceSlot" DROP COLUMN "endTime",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "public"."Payment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Payment_stripeSessionId_idx" ON "public"."Payment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PriceSlot_courtId_idx" ON "public"."PriceSlot"("courtId");
