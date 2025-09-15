"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/prisma";

/**
 * Fetches the profile information for the currently authenticated user.
 * @returns An object containing the user's name, email, image, and total booking count.
 * @throws Will throw an error if the user is not authenticated or not found in the database.
 */
export async function getUserProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("User is not authenticated. Please log in.");
  }

  const userId = session.user.id;

  // Fetch user details and a count of their bookings in parallel
  const [user, totalBookings] = await Promise.all([
    db.user.findUnique({
      where: { id: Number(userId) },
      select: {
        fullName: true,
        email: true,
        avatarUrl: true,
      },
    }),
    db.booking.count({
      where: { userId: Number(userId) },
    }),
  ]);

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    name: user.fullName,
    email: user.email,
    image: user.avatarUrl,
    totalBookings,
  };
}
