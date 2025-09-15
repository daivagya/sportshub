// src/app/(owner)/manager/_actions/dashboard.actions.ts
"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { BookingStatus, Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
export async function getDashboardData() {
  // 1. Get the current user and their owner profile (No changes here)
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") {
    throw new Error("Not authorized or not an owner.");
  }

  const owner = await db.facilityOwner.findUnique({
    where: { userId: user.id },
    include: { venues: { select: { id: true } } },
  });

  if (!owner) {
    throw new Error("Owner profile not found.");
  }

  const venueIds = owner.venues.map((v) => v.id);

  if (venueIds.length === 0) {
    return {
      stats: { bookings: 0, venues: 0, earnings: 0, reviews: 0 },
      bookingStats: { indoor: {}, outdoor: {} },
      monthlyEarnings: { labels: [], data: [] },
    };
  }

  // 2. Define data-fetching promises
  // These simple stats queries are already efficient.
  const totalBookingsPromise = db.booking.count({
    where: {
      court: { venueId: { in: venueIds } },
      status: BookingStatus.CONFIRMED,
    },
  });

  const totalEarningsPromise = db.booking.aggregate({
    _sum: { totalAmount: true },
    where: {
      court: { venueId: { in: venueIds } },
      status: BookingStatus.CONFIRMED, // Changed from COMPLETED
    },
  });

  const totalReviewsPromise = db.venueReview.count({
    where: { venueId: { in: venueIds } },
  });

  // This query for the doughnut charts is already efficient.
  // It fetches one row per court, not one row per booking.
  const bookingStatsPromise = db.court.findMany({
    where: {
      venueId: { in: venueIds },
    },
    select: {
      sport: true,
      type: true,
      _count: {
        select: {
          bookings: {
            where: {
              status: BookingStatus.CONFIRMED,
            },
          },
        },
      },
    },
  });

  // ✨ CORRECTED: Fetch monthly earnings efficiently without raw queries.
  // We create 6 small aggregation promises (one for each month) and run them in parallel.
  // This is much faster than fetching all individual bookings.
  const monthLabels: string[] = [];
  const monthlyEarningsPromises = [];
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    // Go back to the target month and set to the first day
    date.setMonth(date.getMonth() - i, 1);
    date.setHours(0, 0, 0, 0);
    const startDate = new Date(date);

    // Get the first day of the *next* month, which serves as our exclusive end date
    date.setMonth(date.getMonth() + 1);
    const endDate = new Date(date);

    monthLabels.push(monthFormatter.format(startDate));

    monthlyEarningsPromises.push(
      db.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          court: { venueId: { in: venueIds } },
          status: BookingStatus.CONFIRMED, // Changed from COMPLETED
          createdAt: {
            gte: startDate,
            lt: endDate, // 'lt' ensures we don't include the start of the next month
          },
        },
      })
    );
  }

  // 3. Execute all promises in parallel
  // This now includes the 6 small earnings promises instead of one large one.
  const [
    totalBookings,
    totalEarningsResult,
    totalReviews,
    bookingStatsResult,
    ...monthlyEarningsResults // Use rest syntax to gather the 6 results
  ] = await Promise.all([
    totalBookingsPromise,
    totalEarningsPromise,
    totalReviewsPromise,
    bookingStatsPromise,
    ...monthlyEarningsPromises, // Spread the 6 promises into the array
  ]);

  // 4. Process the results
  const stats = {
    bookings: totalBookings || 0,
    venues: venueIds.length,
    earnings: totalEarningsResult._sum.totalAmount || 0,
    reviews: totalReviews || 0,
  };

  // Processing for booking stats remains the same and is correct.
  const bookingStats: {
    indoor: { [key: string]: number };
    outdoor: { [key: string]: number };
  } = { indoor: {}, outdoor: {} };

  bookingStatsResult.forEach((court) => {
    const type = court.type.toLowerCase();
    if (
      (type === "indoor" || type === "outdoor") &&
      court._count.bookings > 0
    ) {
      bookingStats[type][court.sport] =
        (bookingStats[type][court.sport] || 0) + court._count.bookings;
    }
  });

  //  CORRECTED: Process the results from the 6 parallel aggregations.
  const monthlyEarnings = {
    labels: monthLabels,
    data: monthlyEarningsResults.map((result) => result._sum.totalAmount || 0),
  };

  return { stats, bookingStats, monthlyEarnings };
}

export async function revalidateDashboard() {
  revalidatePath("/(owner)/manager/dashboard");
}
