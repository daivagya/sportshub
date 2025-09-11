/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PriceSlot` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PriceSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[courtId,startTime]` on the table `PriceSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."PriceSlot_courtId_idx";

-- AlterTable
ALTER TABLE "public"."PriceSlot" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "PriceSlot_courtId_startTime_key" ON "public"."PriceSlot"("courtId", "startTime");
