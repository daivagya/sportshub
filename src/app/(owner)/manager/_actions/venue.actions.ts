// src/app/(owner)/manager/_actions/venue.actions.ts

"use server"; // This is CRITICAL! It marks all functions in this file as Server Actions.

import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { Venue } from "@/types/next-auth";
// --- ACTION 2 (MODIFIED): Create a new venue ---
export async function createVenue(venueData: Venue) {
  const user = await getCurrentUser();
  let ownerId;
  if (!user || !user.id) {
    return { error: "You must be logged in to create a venue." };
  }

  if (user.role == "OWNER") {
    ownerId = await prisma.facilityOwner.findUnique({
      where: { userId: Number(user.id) },
    });
    if (!ownerId || !ownerId.id) {
      throw new Error("Cannot create a venue without a valid owner.");
    }
  }

  // Destructure the data directly from the input object
  const {
    name,
    slug,
    description,
    address,
    city,
    state,
    country,
    amenities,
    photos, // <-- These are now URLs
  } = venueData;

  // Basic validation to ensure photos were passed
  if (!photos || photos.length === 0) {
    return { error: "At least one photo URL is required." };
  }

  try {
    // ASSEMBLE PRISMA PAYLOAD - much simpler now
    const prismaPayload = {
      name,
      slug,
      description,
      address,
      city,
      state,
      country,
      amenities: { set: amenities },
      photos: { set: photos }, // <-- Save the array of URLs
      owner: {
        connect: ownerId,
      },
    };

    // CREATE VENUE in the database
    await prisma.venue.create({
      data: prismaPayload,
    });

    // Optional: Revalidate the path to show the new venue immediately
    revalidatePath("/manager/venues");

    return { success: "Venue created successfully!" };
  } catch (error) {
    console.error("Failed to create venue:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function getOwnedVenues() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { error: "You must be logged in to view venues." };
    }

    if (user.role !== "OWNER") {
      return { error: "Only owners can view their venues." };
    }

    // Directly filter by relation: Venue -> FacilityOwner -> User
    const venues = await prisma.venue.findMany({
      where: {
        owner: {
          userId: Number(user.id),
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        amenities: true,
        photos: true,
        approved: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return Response.json(venues);
  } catch (err) {
    console.error("Error fetching owned venues:", err);
    return new Response("Failed to fetch venues", { status: 500 });
  }
}
