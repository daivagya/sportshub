// src/app/api/user/getVenues/route.ts
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const venues = await db.venue.findMany({
      //   where: { approved: true }, // optional filter
      orderBy: { createdAt: "desc" }, // latest venues first
      select: {
        name: true,
        slug: true,
        description: true,
        city: true,
        state: true,
        country: true,
        address: true,
        amenities: true,
        photos: true,
      },
    });

    console.log("Venues from getVenuesRoute---->>>", venues);

    return Response.json(venues);
  } catch (err) {
    console.error("Error fetching venues:", err);
    return new Response("Failed to fetch venues", { status: 500 });
  }
}
