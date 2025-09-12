"use server";

import crypto from "crypto";
import Stripe from "stripe";
import { db as prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/session";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "Asia/Kolkata";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // let SDK default API version

// ====== Types ======
export type CreateBookingResult =
  | { success: true; bookingId: number; url: string }
  | { success: false; error: string };

export type GeneralActionResult =
  | { success: true }
  | { success: false; error: string };

// ------------------------------
// createBooking
// - create a PENDING Booking (inside short transaction that locks court)
// - create Stripe Checkout session (outside tx)
// - create a Payment row (PENDING) storing stripeSessionId + url and link to booking
// - set booking.paymentId -> payment.id
// ------------------------------
export async function createBooking(args: {
  courtSlug: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  userEmail?: string;
  idempotencyKey?: string;
}): Promise<CreateBookingResult> {
  const { courtSlug, startTime, endTime, userEmail } = args;
  const idempotencyKey = args.idempotencyKey ?? crypto.randomUUID();
  // esure all required fields are present
  if (!courtSlug || !startTime || !endTime || !args.userId) {
    return { success: false, error: "Missing required fields." };
  }

  // FIX 3: Safely parse the userId and validate it
  const userId = parseInt(args.userId, 10);
  if (isNaN(userId)) {
    return { success: false, error: "Invalid user ID." };
  }

  if (endTime <= startTime) {
    return { success: false, error: "Invalid booking time" };
  }

  const existing = await prisma.booking.findUnique({
    where: { idempotencyKey },
    include: { payment: true },
  });
  if (existing) {
    return {
      success: true,
      bookingId: existing.id,
      url: existing.payment?.stripeSessionUrl ?? "",
    };
  }


  try {
    const created = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "Court" WHERE slug = ${courtSlug} FOR UPDATE`;

      const court = await tx.court.findUnique({
        where: { slug: courtSlug },
        include: { priceSlots: true, venue: true },
      });
      console.log("Court found in createBooking:", court);
      if (!court) throw new Error("Court not found");
      
      // const overlapping = await tx.booking.findFirst({ /* ... overlap check ... */ });
      // console.log("Overlapping booking check result:", overlapping);
      // if (overlapping) throw new Error("Slot already booked");
      console.log("No overlapping bookings found.");

      // FIX 1: Find the correct price for the booked time slot
      const bookingStartHour = dayjs(startTime).tz(TIMEZONE).hour();
      const relevantPriceSlot = court.priceSlots.find(
        ps => bookingStartHour >= ps.startTime && bookingStartHour < ps.endTime
      );
      console.log("Relevant price slot:", relevantPriceSlot);
      const slotPrice = relevantPriceSlot?.pricePerHour ?? 500; // Fallback price
      console.log("Slot price determined:", slotPrice);

      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      console.log("Duration in hours:", durationHours);
      const totalAmount = Math.round(durationHours * slotPrice);
      console.log("Total amount calculated:", totalAmount);
      const booking = await tx.booking.create({
        data: {
          userId: userId, // Use the parsed, safe userId
          courtId: court.id,
          startTime,
          endTime,
          status: BookingStatus.PENDING,
          totalAmount,
          currency: court.currency ?? "INR",
          idempotencyKey: idempotencyKey ?? "",
        },
      });
      console.log("Booking created with ID:", booking);

      return {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        courtName: court.name,
        venueName: court.venue.name,
      };
    });
    console.log('cireated:', created);

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: created.currency.toLowerCase(),
              product_data: {
                name: `${created.courtName} at ${created.venueName}`,
              },
              // FIX 2: Multiply by 100 to convert to paise
              unit_amount: created.amount * 100,
            },
            quantity: 1,
          },
        ],
        metadata: { bookingId: String(created.bookingId) },
        success_url: `${process.env.NEXT_APP_PUBLIC_URL}/booking/success?bookingId=${created.bookingId}`,
        cancel_url: `${process.env.NEXT_APP_PUBLIC_URL}/booking/cancel?bookingId=${created.bookingId}`,
      },
      { idempotencyKey }
    );

    console.log("Stripe session created:", session.id);
    if (!session.url) throw new Error("Failed to create Stripe session");
    
    // The rest of the function (creating the Payment record) remains the same...
    // await prisma.$transaction(async (tx) => {
    //     // ...
    // });

    return {
      success: true,
      bookingId: created.bookingId,
      url: session.url ?? "",
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAvailabilityForCourt(courtSlug: string, date: string) {
  try {
    const court = await prisma.court.findUnique({
      where: { slug: courtSlug },
      include: { priceSlots: { orderBy: { startTime: 'asc' } } },
    });

    if (!court) {
      return { success: false, error: "Court not found." };
    }

    const dayStart = dayjs.tz(date, TIMEZONE).startOf("day");
    const dayEnd = dayjs.tz(date, TIMEZONE).endOf("day");

    // NEW: Get the current time in the correct timezone
    const now = dayjs().tz(TIMEZONE);
    // NEW: Check if the selected date is today
    const isToday = dayStart.isSame(now, 'day');

    const existingBookings = await prisma.booking.findMany({
      where: {
        courtId: court.id,
        startTime: {
          gte: dayStart.toDate(),
          lt: dayEnd.toDate(),
        },
      },
      select: { startTime: true },
    });
    
    const bookedHours = new Set(
      existingBookings.map(b => dayjs(b.startTime).tz(TIMEZONE).format("HH:00"))
    );

    const slots = [];
    for (let hour = court.openTime; hour < court.closeTime; hour++) {
      const slotStartMoment = dayStart.hour(hour);

      // NEW: If the date is today, check if the slot's start time has passed.
      // If it has, skip this iteration and don't include the slot.
      if (isToday && slotStartMoment.isBefore(now)) {
        continue;
      }

      const relevantPriceSlot = court.priceSlots.find(
        ps => hour >= ps.startTime && hour < ps.endTime
      );

      const isBooked = bookedHours.has(slotStartMoment.format("HH:00"));

      slots.push({
        start: slotStartMoment.format("HH:mm"),
        end: slotStartMoment.add(1, 'hour').format("HH:mm"),
        price: relevantPriceSlot?.pricePerHour,
        isBooked,
      });
    }

    return { success: true, data: { court, slots } };
  } catch (error) {
    console.error("Error fetching availability:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

// ------------------------------
// confirmBookingFromStripeSession
// - find booking by metadata.bookingId
// - find associated Payment (by bookingId OR stripeSessionId)
// - call Stripe to retrieve PaymentIntent -> charges -> receipt_url
// - update Payment => SUCCEEDED, set stripePaymentIntentId/stripeChargeId/receiptUrl
// - update Booking => CONFIRMED
// ------------------------------
export async function confirmBookingFromStripeSession(
  session: Stripe.Checkout.Session
): Promise<{ success: true } | { success: false; error: string }> {
  const bookingId = Number(session.metadata?.bookingId);
  if (!bookingId) {
    return { success: false, error: "Missing bookingId in metadata" };
  }

  try {
    // 1) Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) return { success: false, error: "Booking not found" };

    // 2) Find existing payment (by bookingId or fallback to stripeSessionId)
    let payment = await prisma.payment.findUnique({
      where: { bookingId: booking.id },
    });

    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: { stripeSessionId: session.id },
      });
    }

    // 3) Only keep payment_intent reference
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;

    // 4) Update DB inside transaction
    await prisma.$transaction(async (tx) => {
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCEEDED,
            stripePaymentIntentId: paymentIntentId ?? undefined,
          },
        });

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CONFIRMED, paymentId: payment.id },
        });
      } else {
        const newPayment = await tx.payment.create({
          data: {
            bookingId: booking.id,
            gateway: "stripe",
            stripePaymentIntentId: paymentIntentId ?? undefined,
            amount: booking.totalAmount,
            currency: booking.currency,
            status: PaymentStatus.SUCCEEDED,
          },
        });

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CONFIRMED, paymentId: newPayment.id },
        });
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error("[confirmBookingFromStripeSession] Error:", err);
    return { success: false, error: "Database error during confirmation" };
  }
}



// ------------------------------
// cancelPendingBookingBySession
// - used on checkout.session.expired
// - mark booking CANCELLED and payment FAILED (if exists)
// ------------------------------
export async function cancelPendingBookingBySession(
  session: Stripe.Checkout.Session
): Promise<GeneralActionResult> {
  const bookingId = Number(session.metadata?.bookingId);
  if (!bookingId) return { success: true };

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) return { success: true };

    await prisma.$transaction(async (tx) => {
      if (booking.status === BookingStatus.PENDING) {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
        });
      }

      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: PaymentStatus.FAILED },
        });
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error("[cancelPendingBookingBySession] Error:", err);
    return { success: false, error: "Failed to cancel booking" };
  }
}

// ------------------------------
// getUserBookings (unchanged, but keep including payment)
// ------------------------------
export async function getUserBookings() {
  const user = await getCurrentUser();
  if (!user?.id) return [];

  return prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      court: {
        include: {
          venue: true,
        },
      },
      payment: true,
    },
    orderBy: { startTime: "desc" },
  });
}
