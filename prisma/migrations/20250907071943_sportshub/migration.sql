/*
  Warnings:

  - You are about to drop the column `rating` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Court` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_venueId_fkey";

-- AlterTable
ALTER TABLE "public"."Court" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Venue" DROP COLUMN "rating",
ALTER COLUMN "city" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."Review";

-- CreateTable
CREATE TABLE "public"."VenueReview" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourtReview" (
    "id" SERIAL NOT NULL,
    "courtId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourtReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Court_type_idx" ON "public"."Court"("type");

-- AddForeignKey
ALTER TABLE "public"."VenueReview" ADD CONSTRAINT "VenueReview_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VenueReview" ADD CONSTRAINT "VenueReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourtReview" ADD CONSTRAINT "CourtReview_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourtReview" ADD CONSTRAINT "CourtReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
