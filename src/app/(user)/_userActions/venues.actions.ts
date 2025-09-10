"use server";

import { PrismaClient,Prisma } from "@/generated/prisma/client";
import { Venue } from "@/types/next-auth";
import { VenueFilters } from "@/types/next-auth";
import { VenueDetails } from "@/types/next-auth";
const prisma = new PrismaClient();

export interface GetVenuesResult {
  venues: Venue[];
  totalPages: number;
  currentPage: number;
}


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
    courts: dbVenue.courts,
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
const venueDetailsSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  address: true,
  city: true,
  state: true,
  country: true,
  amenities: true,
  photos: true,
  courts: {
    select: {
      id: true,
      name: true,
      slug: true,
      sport: true,
      imageUrl: true,
      priceSlots: {
        orderBy: { pricePerHour: "asc" },
        take: 1,
        select: { pricePerHour: true },
      },
    },
  },
  // reviews: {
  //   user: { select: { name: true } } , // ✅ use include instead of select
  //   orderBy: { createdAt: "desc" },
  //   take: 5,
  // },
} satisfies Prisma.VenueSelect; // ✅ this type exists



type VenueDetailsFromDB = Prisma.VenueGetPayload<{
  select: typeof venueDetailsSelect;
}>;

export async function getVenueBySlug(slug: string) {
  try {
    const dbVenue: VenueDetailsFromDB | null = await prisma.venue.findUnique({
      where: { slug },
      select: venueDetailsSelect,
    });

    if (!dbVenue) return null;

    // const totalRating = dbVenue.reviews.reduce((acc, r) => acc + r.rating, 0);
    // const averageRating =
    //   dbVenue.reviews.length > 0 ? totalRating / dbVenue.reviews.length : 0;

    return {
      ...dbVenue,
      // averageRating: parseFloat(averageRating.toFixed(1)),
      courts: dbVenue.courts.map((court) => ({
        id: court.id,
        name: court.name,
        slug: court.slug,
        sport: court.sport,
        image: court.imageUrl,
        price: court.priceSlots[0]?.pricePerHour ?? null,
      })),
      // reviews: dbVenue.reviews.map((review) => ({
      //   id: review.id,
      //   rating: review.rating,
      //   comment: review.comment,
      //   createdAt: review.createdAt,
      //   userName: review.user.name,
      // })),
    };
  } catch (error) {
    console.error(`Failed to fetch venue with slug ${slug}:`, error);
    return null;
  }
}


// Paginated query
export async function filterVenues(
  filters:  Partial<VenueFilters> = {}
): Promise<GetVenuesResult> {
  try {
    const {
      q,
      sport,
      price,
      venueType,
      rating,
      city,
      page = 1,
      limit = 9,
    } = filters;

    const pageNumber = Math.max(1, Number(page));
    const venuesPerPage = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * venuesPerPage;

    // Build Prisma where clause dynamically
    const whereClause: any = {
      ...(q?.trim()
        ? { name: { contains: q.trim(), mode: "insensitive" } }
        : {}),
      ...(sport ? { courts: { some: { sport } } } : {}),
      ...(price
        ? {
            courts: {
              some: {
                priceSlots: { some: { pricePerHour: { lte: price } } },
              },
            },
          }
        : {}),
      ...(venueType && venueType !== "All" ? { venueType } : {}),
      ...(rating && rating > 0
        ? { reviews: { some: { rating: { gte: rating } } } }
        : {}),
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
    };

    // ✅ Fetch total count + venues in one transaction
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
              priceSlots: {
                orderBy: { pricePerHour: "asc" },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalVenuesCount / venuesPerPage);

    // ✅ Transform venues into your frontend format
    const venues: Venue[] = dbVenues.map(transformDbVenue);

    return { venues, totalPages, currentPage: pageNumber };
  } catch (err) {
    console.error("Error filtering venues:", err);
    return { venues: [], totalPages: 1, currentPage: 1 };
  }
}

// --- Action 2: Get Venues by City (Paginated) ---
// export async function getVenuesByCity({
//   city,
//   page = 1,
//   limit = 9,
// }: {
//   city: string;
//   page?: number;
//   limit?: number;
// }): Promise<GetVenuesResult> {
//   try {
//     const pageNumber = Math.max(1, Number(page));
//     const venuesPerPage = Math.max(1, Number(limit));
//     const skip = (pageNumber - 1) * venuesPerPage;

//     const whereClause: Prisma.VenueWhereInput = {
//       city: {
//         equals: city,
//         mode: "insensitive",
//       },
//     };

//     const [totalVenuesCount, dbVenues] = await prisma.$transaction([
//       prisma.venue.count({ where: whereClause }),
//       prisma.venue.findMany({
//         where: whereClause,
//         skip,
//         take: venuesPerPage,
//         orderBy: { createdAt: "desc" },
//         include: {
//           reviews: { select: { rating: true } },
//           courts: {
//             select: {
//               sport: true,
//               priceSlots: { orderBy: { pricePerHour: "asc" }, take: 1 },
//             },
//           },
//         },
//       }),
//     ]);

//     const totalPages = Math.ceil(totalVenuesCount / venuesPerPage);
//     const venues = dbVenues.map(transformDbVenue);

//     return { venues, totalPages, currentPage: pageNumber };
//   } catch (error) {
//     console.error(`Failed to fetch venues for city ${city}:`, error);
//     return { venues: [], totalPages: 1, currentPage: 1 };
//   }
// }

// --- Action 3: Get a Single Venue by its Slug ---

// ..................................................................................................

// --- Reusable Helper Function ---
// To avoid repeating code, this function transforms the database object
// into the client-safe object we need.
// function transformDbVenue(dbVenue: any): Venue {
//   const totalRating = dbVenue.reviews.reduce(
//     (sum: number, review: { rating: number }) => sum + review.rating,
//     0
//   );
//   const averageRating =
//     dbVenue.reviews.length > 0
//       ? parseFloat((totalRating / dbVenue.reviews.length).toFixed(1))
//       : 0;

//   // Since a venue can have multiple courts, we need a strategy for what to display.
//   // Here, we'll display the sport of the first court and find the lowest price.
//   const representativeCourt = dbVenue.courts[0];
//   const lowestPrice = dbVenue.courts.reduce((min: number, court: any) => {
//     const courtMinPrice = court.priceSlots[0]?.pricePerHour;
//     return courtMinPrice && courtMinPrice < min ? courtMinPrice : min;
//   }, Infinity);

//   return {
//     slug: dbVenue.slug,
//     name: dbVenue.name,
//     description: dbVenue.description,
//     city: dbVenue.city ?? "",
//     address: dbVenue.address,
//     state: dbVenue.state,
//     country: dbVenue.country,
//     amenities: dbVenue.amenities,
//     photos: dbVenue.photos,
//     sport: representativeCourt?.sport ?? "Multiple Sports",
//     price: lowestPrice === Infinity ? undefined : lowestPrice,
//     venueType: "Indoor", // This still needs a better strategy
//     averageRating: averageRating,
//   };
// }
