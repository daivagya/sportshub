import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // ✅ check if logged in
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ only owners should submit onboarding
    if (session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can complete onboarding" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { phone, businessName, address } = body;

    // ✅ check if already onboarded
    const existingOwner = await db.facilityOwner.findUnique({
      where: { userId: Number(session.user.id) },
    });

    if (existingOwner) {
      return NextResponse.json(
        { error: "Owner profile already exists" },
        { status: 400 }
      );
    }

    // ✅ create owner profile
    const ownerProfile = await db.facilityOwner.create({
      data: {
        userId: Number(session.user.id),
        phone,
        businessName,
        address,
      },
    });

    return NextResponse.json(
      { message: "Onboarding complete", ownerProfile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
