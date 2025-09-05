// src/app/(owner)/manager/_actions/venue.actions.ts

'use server'; // This is CRITICAL! It marks all functions in this file as Server Actions.

import {db as prisma} from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";



// --- ACTION 1: Get all venues owned by a specific manager ---
export async function getOwnedVenues(managerId: number) {
  try {
    const venues = await prisma.venue.findMany({
      where: { ownerId: managerId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: venues };
  } catch (error) { 
    console.error("Failed to fetch venues:", error);
    return { error: "Something went wrong. Could not fetch venues." };
  }
}

// --- ACTION 2: Create a new venue ---

export async function createVenue(formData: FormData) {
  // 1. AUTHENTICATION: Get the current user. This is crucial for the `owner` relation.
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return { error: "You must be logged in to create a venue." };
  }

  try {
    // 2. EXTRACT & TRANSFORM DATA from FormData
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;
    
    // Parse the amenities JSON string back into an array
    const amenities = JSON.parse(formData.get("amenities") as string || "[]");
    
    // 3. HANDLE FILE UPLOADS: Get files and upload them to cloud storage
    const photos = formData.getAll("photos") as File[];
    const photoUrls: string[] = [];

    for (const photo of photos) {
      // You need a helper function to handle the upload to a service like Cloudinary or S3
      const result = await uploadToCloudinary(photo);
      if (result?.secure_url) {
        photoUrls.push(result.secure_url);
      }
    }

    if (photoUrls.length === 0) {
      return { error: "Photo upload failed." };
    }

    // 4. ASSEMBLE PRISMA PAYLOAD: Create the final object for the database
    const venueData = {
      name,
      slug,
      description,
      address,
      city,
      state,
      country,
      amenities: {
        set: amenities, // Use `set` for array fields in Prisma
      },
      photos: {
        set: photoUrls, // Save the array of URLs
      },
      owner: {
        connect: {
          id: user.id, // Connect the venue to the logged-in user
        },
      },
    };

    // 5. CREATE VENUE in the database
    await prisma.venue.create({
      data: venueData,
    });

    return { success: "Venue created successfully!" };
  } catch (error) {
    console.error("Failed to create venue:", error);
    return { error: "An unexpected error occurred." };
  }
}