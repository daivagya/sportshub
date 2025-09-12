"use server"
import { db } from "@/lib/prisma";
import { Court } from "@/types/next-auth"; // court.actions.ts
const TIMEZONE = "Asia/Kolkata";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function getCourts(limit = 10): Promise<Court[]> {
  try {
    const courtsFromDb = await db.court.findMany({
      take: limit,
      include: {
        venue: true,
        priceSlots: true,
        reviews: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map DB response to the exact Court type
    const courts: Court[] = courtsFromDb.map((c) => ({
      id: c.id,
      name: c.name,
      sport: c.sport,
      type: c.type,
      currency: c.currency,
      openTime: c.openTime,
      closeTime: c.closeTime,
      priceSlots: c.priceSlots.map((slot) => ({
        startTime: slot.startTime,
      })),
      slug: c.slug,
      venueName: c.venue?.name ?? "Unnamed Venue",
      imageUrl: c.imageUrl,
      reviewCount: c.reviews.length,
      averageRating:
        c.reviews.length > 0
          ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length
          : 0,
    }));

    return courts;
  } catch (err) {
    console.error("Error fetching courts:", err);
    return [];
  }
}

export async function getAvailabilityForCourt(courtSlug: string, date: string) {
  try {
    // 1. Find the specific court by its unique slug
    const court = await db.court.findUnique({
      where: { slug: courtSlug },
      // Include the price tiers set by the manager
      include: { priceSlots: { orderBy: { startTime: "asc" } } },
    });

    if (!court) {
      return { success: false, error: "Court not found." };
    }

    // 2. Define the time range for the selected day in the correct timezone
    const dayStart = dayjs.tz(date, TIMEZONE).startOf("day");
    const dayEnd = dayjs.tz(date, TIMEZONE).endOf("day");
    const now = dayjs().tz(TIMEZONE);
    const isToday = dayStart.isSame(now, "day");

    // 3. Find all existing bookings for this court on the selected date
    const existingBookings = await db.booking.findMany({
      where: {
        courtId: court.id,
        startTime: {
          gte: dayStart.toDate(),
          lt: dayEnd.toDate(),
        },
      },
      select: { startTime: true },
    });

    // Create a simple Set of booked hours for fast checking
    const bookedHours = new Set(
      existingBookings.map((b) =>
        dayjs(b.startTime).tz(TIMEZONE).format("HH:00")
      )
    );

    const slots = [];
    // 4. Generate all possible hourly slots based on the court's operating hours
    for (let hour = court.openTime; hour < court.closeTime; hour++) {
      const slotStartMoment = dayStart.hour(hour);

      // 5. If the date is today, skip any slots that have already passed
      if (isToday && slotStartMoment.isBefore(now)) {
        continue;
      }

      // Find the correct price for the current hour from the price tiers
      const relevantPriceSlot = court.priceSlots.find(
        (ps) => hour >= ps.startTime && hour < ps.endTime
      );

      // Check if the current slot is in our Set of booked hours
      const isBooked = bookedHours.has(slotStartMoment.format("HH:00"));

      slots.push({
        start: slotStartMoment.format("HH:mm"),
        end: slotStartMoment.add(1, "hour").format("HH:mm"),
        price: relevantPriceSlot?.pricePerHour,
        isBooked,
      });
    }

    // 6. Return the court's data along with the final list of slots
    return { success: true, data: { court, slots } };
  } catch (error) {
    console.error("Error fetching availability:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
