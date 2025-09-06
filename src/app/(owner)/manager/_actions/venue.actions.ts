// src/app/(owner)/manager/_actions/venue.actions.ts

"use server"; // This is CRITICAL! It marks all functions in this file as Server Actions.

import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

// --- ACTION 2 (MODIFIED): Create a new venue ---
export async function createVenue(venueData: {
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  amenities: string[];
  photos: string[]; // <-- Now expects an array of URLs
}) {
  const user = await getCurrentUser();
  let ownerId;
  if (!user || !user.id) {
    return { error: "You must be logged in to create a venue." };
  }

  if (user.role == "OWNER") {
    ownerId = await prisma.facilityOwner.findUnique({
      where: { userId: user.id },
    });
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

// --- ACTION 2: Get all venues owned by a specific manager ---
export async function getOwnedVenues(managerId: number) {
  try {
    const venues = await prisma.venue.findMany({
      where: { ownerId: managerId },
      orderBy: { createdAt: "desc" },
    });
    return { data: venues };
  } catch (error) {
    console.error("Failed to fetch venues:", error);
    return { error: "Something went wrong. Could not fetch venues." };
  }
}
