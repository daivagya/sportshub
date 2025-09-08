/*
  Warnings:

  - You are about to drop the column `pricePerHour` on the `Court` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Court" DROP COLUMN "pricePerHour";

-- CreateTable
CREATE TABLE "public"."PriceSlot" (
    "id" SERIAL NOT NULL,
    "courtId" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "pricePerHour" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceSlot_courtId_idx" ON "public"."PriceSlot"("courtId");

-- AddForeignKey
ALTER TABLE "public"."PriceSlot" ADD CONSTRAINT "PriceSlot_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
