/*
  Warnings:

  - Added the required column `imageUrl` to the `Court` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Court" ADD COLUMN     "imageUrl" TEXT NOT NULL;
