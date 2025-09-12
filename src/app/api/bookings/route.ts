// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createBooking } from "@/app/(user)/_userActions/booking.actions";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courtSlug, startTime, endTime } = body;

    if (!courtSlug || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const idempotencyKey =
      req.headers.get("Idempotency-Key") ?? crypto.randomUUID();

    const result = await createBooking({
      courtSlug,
      startTime: start,
      endTime: end,
      userId: user.id.toString(),
      userEmail: user.email,
      idempotencyKey,
    });

    if (!result.success) {
      const status =
        result.error === "Court not found"
          ? 404
          : result.error === "Slot already booked"
          ? 409
          : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      bookingId: result.bookingId,
      stripeSessionUrl: result.url,
    });
  } catch (err) {
    console.error("❌ API /bookings POST Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
