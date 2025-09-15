"use server";

import { db as prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/authOptions";
import { BookingStatus } from "@/generated/prisma";
export async function getManagerBookings() {
  const user = await getServerSession(authOptions).then((s) => s?.user);
  if (!user) throw new Error("Unauthorized");

  // ensure user is a manager / facility owner
  const owner = await prisma.facilityOwner.findUnique({
    where: { userId: Number(user.id) },
  });
  if (!owner) throw new Error("Not a facility owner");

  // fetch bookings for courts inside venues owned by this manager
  const bookings = await prisma.booking.findMany({
    where: {
      court: {
        venue: {
          ownerId: owner.id,
        },
      },
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      court: {
        include: {
          venue: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map((b) => ({
    id: b.id,
    personName: b.user.fullName,
    personEmail: b.user.email,
    courtName: b.court.name,
    venueName: b.court.venue.name,
    sport: b.court.sport,
    startTime: b.startTime,
    endTime: b.endTime,
    day: b.startTime.toDateString(),
    amount: b.totalAmount, // if stored in paise/cents
    currency: b.currency,
    status: b.status,
  }));
}
async function getBookingAndVerifyOwner(bookingId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "OWNER") {
    throw new Error("Not authorized.");
  }

  // 1. Find the owner profile linked to the logged-in user
  const owner = await prisma.facilityOwner.findUnique({
    where: { userId: Number(session.user.id) },
    select: { id: true },
  });

  if (!owner) {
    throw new Error("Owner profile not found for the current user.");
  }

  // 2. Find the requested booking
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
    select: {
      id: true,
      status: true,
      endTime: true,
      court: {
        select: {
          venue: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // 3. CRITICAL: Verify the booking's venue ownerId matches the manager's ownerId
  if (booking.court.venue.ownerId !== owner.id) {
    throw new Error("You do not have permission to manage this booking.");
  }

  return booking;
}

// CANCEL A BOOKING
export async function cancelManagerBooking(bookingId: string) {
  try {
    const booking = await getBookingAndVerifyOwner(bookingId);

    if (booking.status === BookingStatus.CONFIRMED) {
      return {
        error: "Confirmed bookings cannot be cancelled by a manager.",
      };
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      return {
        error: `Booking is already ${booking.status.toLowerCase()}.`,
      };
    }

    // Prevent cancelling past bookings
    if (booking.endTime < new Date()) {
      return { error: "Cannot cancel a booking that is in the past." };
    }

    // Update the booking status to CANCELLED
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED },
    });

    revalidatePath("/(owner)/manager/bookings", "page");

    return { success: "Booking successfully cancelled." };
  } catch (error: any) {
    console.error("Failed to cancel booking:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

// CONFIRM A PENDING BOOKING
export async function confirmManagerBooking(bookingId: string) {
  try {
    const booking = await getBookingAndVerifyOwner(bookingId);

    if (booking.status !== BookingStatus.PENDING) {
      return { error: "Only pending bookings can be confirmed." };
    }

    // Prevent confirming past bookings
    if (booking.endTime < new Date()) {
      return { error: "Cannot confirm a booking that is in the past." };
    }

    // Update the booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: { status: BookingStatus.CONFIRMED },
    });

    revalidatePath("/(owner)/manager/bookings", "page");

    return { success: "Booking successfully confirmed." };
  } catch (error: any) {
    console.error("Failed to confirm booking:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}
