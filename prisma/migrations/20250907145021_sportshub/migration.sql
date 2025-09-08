/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Court` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[venueId,name]` on the table `Court` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Court` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Court" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Court_slug_key" ON "public"."Court"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Court_venueId_name_key" ON "public"."Court"("venueId", "name");
