import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db as prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";

// GET all pending venues for admin review
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const pendingVenues = await prisma.venue.findMany({
      where: { approved: false },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            businessName: true,
          },
        },
        courts: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(pendingVenues);
  } catch (error) {
    console.error("Failed to fetch pending venues:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH to approve a venue
export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { venueId, comments } = await req.json();

    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 });
    }

    const approvedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: { approved: true },
    });

    // Here you might want to send a notification to the venue owner
    // For now, just return success
    return NextResponse.json(approvedVenue);
  } catch (error) {
    console.error("Failed to approve venue:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE to reject (and delete) a venue
export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get("venueId");

    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 });
    }

    // You might want to add the rejection reason to a notification system before deleting
    await prisma.venue.delete({
      where: { id: Number(venueId) },
    });

    return NextResponse.json({ message: "Venue rejected and deleted" });
  } catch (error) {
    console.error("Failed to reject venue:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
