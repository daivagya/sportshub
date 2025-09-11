/*
  Warnings:

  - Added the required column `endTime` to the `PriceSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PriceSlot" ADD COLUMN     "endTime" INTEGER NOT NULL;
