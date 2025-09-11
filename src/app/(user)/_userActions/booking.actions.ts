"use server";

import crypto from "crypto";
import Stripe from "stripe";
import { db as prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/session";

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
  const { courtSlug, startTime, endTime, userId, userEmail } = args;
  const idempotencyKey = args.idempotencyKey ?? crypto.randomUUID();

  if (endTime <= startTime) {
    return { success: false, error: "Invalid booking time" };
  }

  // Idempotency: short-circuit if booking already exists for this key
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
    // 1) create booking in a short transaction while locking the court row
    const created = await prisma.$transaction(async (tx) => {
      // lock the court row
      await tx.$executeRaw`SELECT id FROM "Court" WHERE slug = ${courtSlug} FOR UPDATE`;

      const court = await tx.court.findUnique({
        where: { slug: courtSlug },
        include: { priceSlots: true, venue: true },
      });
      if (!court) throw new Error("Court not found");

      // check overlapping bookings
      const overlapping = await tx.booking.findFirst({
        where: {
          courtId: court.id,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        },
      });
      if (overlapping) throw new Error("Slot already booked");

      const durationHours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const slotPrice = court.priceSlots?.[0]?.pricePerHour ?? 500;
      const totalAmount = Math.round(durationHours * slotPrice);

      const booking = await tx.booking.create({
        data: {
          userId:Number(userId),
          courtId: court.id,
          startTime,
          endTime,
          status: BookingStatus.PENDING,
          totalAmount,
          currency: court.currency ?? "INR",
          idempotencyKey,
        },
      });

      return {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        courtName: court.name,
        venueName: court.venue.name,
      };
    });

    // 2) Create Stripe Checkout Session (outside DB transaction)
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
              unit_amount: created.amount,
            },
            quantity: 1,
          },
        ],
        metadata: { bookingId: String(created.bookingId) },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?bookingId=${created.bookingId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel?bookingId=${created.bookingId}`,
      },
      { idempotencyKey } // send idempotency to Stripe for safety
    );

    // 3) Create Payment record (and link it to booking) in a DB transaction
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId: created.bookingId,
          gateway: "stripe",
          stripeSessionId: session.id,
          stripeSessionUrl: session.url ?? undefined,
          amount: created.amount,
          currency: created.currency,
          status: PaymentStatus.PENDING,
        },
      });

      // Keep booking.paymentId in sync (schema has paymentId on booking)
      await tx.booking.update({
        where: { id: created.bookingId },
        data: { paymentId: payment.id },
      });
    });

    return {
      success: true,
      bookingId: created.bookingId,
      url: session.url ?? "",
    };
  } catch (err: any) {
    if (err.message === "Slot already booked")
      return { success: false, error: "Slot already booked" };
    if (err.message === "Court not found")
      return { success: false, error: "Court not found" };

    console.error("[createBooking] Unexpected:", err);
    return { success: false, error: "Internal server error" };
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

    // 3) Retrieve PaymentIntent details
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;

    let receiptUrl: string | null = null;
    let chargeId: string | null = null;

    if (paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ["charges"],
        });

        // TypeScript-safe check for charges
        if ("charges" in pi && Array.isArray(pi.charges.data)) {
          const charge = pi.charges.data[0];
          if (charge) {
            receiptUrl = charge.receipt_url ?? null;
            chargeId = charge.id ?? null;
          }
        }
      } catch (e) {
        console.warn("[confirmBooking] couldn't retrieve payment intent:", e);
      }
    }

    // 4) Update DB inside transaction
    await prisma.$transaction(async (tx) => {
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCEEDED,
            stripePaymentIntentId: paymentIntentId ?? undefined,
            stripeChargeId: chargeId ?? undefined,
            receiptUrl: receiptUrl ?? undefined,
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
            stripeChargeId: chargeId ?? undefined,
            amount: booking.totalAmount,
            currency: booking.currency,
            status: PaymentStatus.SUCCEEDED,
            receiptUrl: receiptUrl ?? undefined,
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
