"use server";
import { db as prisma } from "@/lib/prisma";
import { AddCourtInput } from "@/types/next-auth";
import { revalidatePath } from "next/cache";

export async function addCourt(input: AddCourtInput) {
  const {
    venueSlug,
    name,
    sport,
    type,
    openTime,
    closeTime,
    priceSlots,
    currency,
    slug,
  } = input;

  // Basic validation
  if (!priceSlots || priceSlots.length === 0) {
    return { error: "At least one price slot is required." };
  }

  try {
    const venue = await prisma.venue.findUnique({
      where: { slug: venueSlug },
      select: { id: true }, // Only select the ID, as that's all we need
    });

    if (!venue) {
      return { error: "Venue not found. Please try again." };
    }

    // This is the core logic for creating the court and its slots together
    await prisma.court.create({
      data: {
        name,
        sport,
        type,
        openTime,
        closeTime,
        currency,
        slug,
        // Connect the court to its parent venue
        venue: {
          connect: {
            id: venue.id,
          },
        },
        // Use a nested 'create' to add all price slots in the same transaction
        priceSlots: {
          create: priceSlots.map((slot) => ({
            startTime: slot.startTime,
            pricePerHour: Number(slot.price), // Map form 'price' to DB 'pricePerHour'
          })),
        },
      },
    });

    // Invalidate the cache to show the new court on the manager's dashboard
    revalidatePath("/manager/venues");
    revalidatePath(`/manager/venues/${venueSlug}`);

    return { success: `Court "${name}" created successfully!` };
  } catch (error) {
    console.error("Failed to add court:", error);
    return { error: "An unexpected error occurred while adding the court." };
  }
}

export async function getCourtsByVenueSlug(slug: string) {
  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      courts: {
        select: {
          id: true,
          name: true,
          sport: true,
          type: true,
          currency: true,
          openTime: true,
          closeTime: true,
          priceSlots: true,
          slug: true,
          // --- CHANGES ARE HERE ---
          // 1. Select only the 'rating' from each review
          reviews: {
            select: {
              rating: true,
            },
          },
          // 2. Ask Prisma to count the total number of reviews
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      },
    },
  });

  if (!venue) {
    return { venue: null, courts: [] };
  }

  // 3. Process the results to calculate the average and format the data
  const processedCourts = venue.courts.map((court) => {
    const reviewCount = court._count.reviews;
    const totalRating = court.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    // Create a new object without the raw 'reviews' and '_count' fields
    const { reviews, _count, ...courtData } = court;

    return {
      ...courtData,
      venueName: venue.name,
      reviewCount,
      averageRating: parseFloat(averageRating.toFixed(1)), // Format to one decimal place
    };
  });

  return { venue, courts: processedCourts };
}


export async function deleteCourtBySlug(slug: string, pathname: string) {
  try {
    // Directly delete the court where the slug matches
    await prisma.court.delete({
      where: { slug: slug },
    });

    revalidatePath(pathname);

    return { success: true, message: "Court deleted successfully." };
  } catch (error) {
    // This will catch errors, including if no record with that slug was found
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}