"use server";
import { db as prisma } from "@/lib/prisma";
import { AddCourtInput } from "@/types/next-auth";
import { revalidatePath } from "next/cache";
import { UpdateCourtByIdInput } from "@/types/next-auth";

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
    imageUrl,
  } = input;

  console.log("Imgae url------------->", imageUrl);
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
        imageUrl,
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

//GET COURTS BY VENUE SLUG
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
          imageUrl: true,
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

//DELETE COURT
export async function deleteCourtById(id: number) {
  try {
    // Delete the court
    const deletedCourt = await prisma.court.delete({
      where: { id },
    });

    // Revalidate relevant paths so updated data shows
    revalidatePath("/manager/venues"); // All venues list

    return { success: true, court: deletedCourt };
  } catch (error: any) {
    console.error("Failed to delete court:", error);
    return { success: false, error: error.message || "Failed to delete court" };
  }
}

//GET COURT BY SLUG
export async function getCourtByCourtSlug(slug: string) {
  try {
    const court = await prisma.court.findUnique({
      where: { slug },
      include: {
        venue: true, // include relations if needed
      },
    });

    return court;
  } catch (error) {
    console.error("Error fetching court by slug:", error);
    return null;
  }
}

//UPDATE COURT
export async function updateCourtById(data: UpdateCourtByIdInput) {
  try {
    const updatedCourt = await prisma.court.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.sport && { sport: data.sport }),
        ...(data.type && { type: data.type }),
        ...(data.openTime !== undefined && { openTime: data.openTime }),
        ...(data.closeTime !== undefined && { closeTime: data.closeTime }),
        ...(data.currency && { currency: data.currency }),
        ...(data.imageUrl && { imageUrl: data.imageUrl }),
        ...(data.priceSlots && {
          priceSlots: {
            deleteMany: {}, // remove old slots
            create: data.priceSlots.map((slot) => ({
              startTime: slot.startTime,
              pricePerHour: Number(slot.price),
            })),
          },
        }),
      },
    });

    return updatedCourt;
  } catch (error) {
    console.error("Failed to update court:", error);
    return null;
  }
}
