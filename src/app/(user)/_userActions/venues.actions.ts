"use server";

import { PrismaClient, Prisma } from '@/generated/prisma/client';

import { Venue } from "@/types/next-auth";

// NOTE: Make sure your prisma client is imported from the correct path
// For you, it should be: import { PrismaClient, Prisma } from "@/generated/prisma";

const prisma = new PrismaClient();

// Define the shape of the data our list actions will return
type GetVenuesResult = {
  venues: Venue[];
  totalPages: number;
  currentPage: number;
};

// --- Reusable Helper Function ---
// To avoid repeating code, this function transforms the database object
// into the client-safe object we need.
function transformDbVenue(dbVenue: any): Venue {
  const totalRating = dbVenue.reviews.reduce(
    (sum: number, review: { rating: number }) => sum + review.rating,
    0
  );
  const averageRating =
    dbVenue.reviews.length > 0
      ? parseFloat((totalRating / dbVenue.reviews.length).toFixed(1))
      : 0;

  // Since a venue can have multiple courts, we need a strategy for what to display.
  // Here, we'll display the sport of the first court and find the lowest price.
  const representativeCourt = dbVenue.courts[0];
  const lowestPrice = dbVenue.courts.reduce((min: number, court: any) => {
    const courtMinPrice = court.priceSlots[0]?.pricePerHour;
    return courtMinPrice && courtMinPrice < min ? courtMinPrice : min;
  }, Infinity);

  return {
    slug: dbVenue.slug,
    name: dbVenue.name,
    description: dbVenue.description,
    city: dbVenue.city ?? "",
    address: dbVenue.address,
    state: dbVenue.state,
    country: dbVenue.country,
    amenities: dbVenue.amenities,
    photos: dbVenue.photos,
    sport: representativeCourt?.sport ?? "Multiple Sports",
    price: lowestPrice === Infinity ? undefined : lowestPrice,
    venueType: "Indoor", // This still needs a better strategy
    averageRating: averageRating,
  };
}

// --- Action 1: Get All Venues (Paginated) ---
export async function getVenues({
  page = 1,
  limit = 9,
}: {
  page?: number;
  limit?: number;
}): Promise<GetVenuesResult> {
  try {
    const pageNumber = Math.max(1, Number(page));
    const venuesPerPage = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * venuesPerPage;

    const [totalVenuesCount, dbVenues] = await prisma.$transaction([
      prisma.venue.count(),
      prisma.venue.findMany({
        skip,
        take: venuesPerPage,
        orderBy: { createdAt: "desc" },
        include: {
          reviews: { select: { rating: true } },
          courts: {
            select: {
              sport: true,
              priceSlots: { orderBy: { pricePerHour: "asc" }, take: 1 },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalVenuesCount / venuesPerPage);
    const venues = dbVenues.map(transformDbVenue);

    return { venues, totalPages, currentPage: pageNumber };
  } catch (error) {
    console.error("Failed to fetch venues:", error);
    return { venues: [], totalPages: 1, currentPage: 1 };
  }
}

// --- Action 2: Get Venues by City (Paginated) ---
export async function getVenuesByCity({
  city,
  page = 1,
  limit = 9,
}: {
  city: string;
  page?: number;
  limit?: number;
}): Promise<GetVenuesResult> {
  try {
    const pageNumber = Math.max(1, Number(page));
    const venuesPerPage = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * venuesPerPage;

    const whereClause: Prisma.VenueWhereInput = {
      city: {
        equals: city,
        mode: "insensitive",
      },
    };

    const [totalVenuesCount, dbVenues] = await prisma.$transaction([
      prisma.venue.count({ where: whereClause }),
      prisma.venue.findMany({
        where: whereClause,
        skip,
        take: venuesPerPage,
        orderBy: { createdAt: "desc" },
        include: {
          reviews: { select: { rating: true } },
          courts: {
            select: {
              sport: true,
              priceSlots: { orderBy: { pricePerHour: "asc" }, take: 1 },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalVenuesCount / venuesPerPage);
    const venues = dbVenues.map(transformDbVenue);

    return { venues, totalPages, currentPage: pageNumber };
  } catch (error) {
    console.error(`Failed to fetch venues for city ${city}:`, error);
    return { venues: [], totalPages: 1, currentPage: 1 };
  }
}

// --- Action 3: Get a Single Venue by its Slug ---
export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  try {
    const dbVenue = await prisma.venue.findUnique({
      where: {
        slug,
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        courts: {
          select: {
            sport: true,
            priceSlots: {
              orderBy: {
                pricePerHour: "asc",
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!dbVenue) {
      return null;
    }

    // Use the same helper to ensure data consistency
    const venue = transformDbVenue(dbVenue);

    return venue;
  } catch (error) {
    console.error(`Failed to fetch venue with slug ${slug}:`, error);
    return null;
  }
}

