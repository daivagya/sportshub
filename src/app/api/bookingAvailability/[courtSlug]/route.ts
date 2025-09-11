import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { court: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    const court = await prisma.court.findUnique({
      where: { slug: params.court },
      include: { priceSlots: true },
    });
    if (!court) {
      return NextResponse.json({ error: "Court not found" }, { status: 404 });
    }

    // Get existing bookings for this day
    const bookings = await prisma.booking.findMany({
      where: {
        courtId: court.id,
        startTime: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      },
      select: { startTime: true, endTime: true, status: true },
    });

    const slots: {
      start: string;
      end: string;
      price: number;
      isBooked: boolean;
    }[] = [];

    for (let hour = court.openTime; hour < court.closeTime; hour++) {
      const start = new Date(
        `${date}T${hour.toString().padStart(2, "0")}:00:00`
      );
      const end = new Date(
        `${date}T${(hour + 1).toString().padStart(2, "0")}:00:00`
      );

      // check if this hour is booked
      const overlapping = bookings.find(
        (b) => start < b.endTime && end > b.startTime
      );

      // price for this hour (default to first priceSlot if no match)
      const slotPrice =
        court.priceSlots.find((ps) => ps.startTime === hour)?.pricePerHour ??
        court.priceSlots[0]?.pricePerHour ??
        500;

      slots.push({
        start: start.toISOString().substring(11, 16), // "HH:mm"
        end: end.toISOString().substring(11, 16),
        price: slotPrice,
        isBooked: Boolean(overlapping),
      });
    }

    return NextResponse.json({ court, slots });
  } catch (err) {
    console.error("❌ bookingAvailability error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
