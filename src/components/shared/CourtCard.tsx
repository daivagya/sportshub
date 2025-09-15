"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getSession } from "next-auth/react";
import { Court } from "@/types/next-auth";
// --- REFACTORED TYPES ---
export type CourtStatus = "CONFIRMED" | "PENDING" | "AVAILABLE";

export type CourtCardProps = {
  court: Court;
  venueName: string;
  venueSlug?: string;
  status: CourtStatus;
  averageRating: number;
  imageUrl: string;
  
};

const STATUS_STYLES: Record<CourtStatus, string> = {
  CONFIRMED: "bg-gradient-to-r from-red-500 to-red-600 text-white",
  PENDING: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
  AVAILABLE: "bg-gradient-to-r from-green-500 to-green-600 text-white",
};

export default function CourtCard({
  court,
  venueName,
  venueSlug,
  status,
  averageRating,
  imageUrl,
}: CourtCardProps) {
  // FIX: Fetch session on the client using hooks to prevent hydration mismatch
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Asynchronously fetch the session and update the state
    const fetchSessionRole = async () => {
      const session = await getSession();
      setRole(session?.user?.role);
    };

    fetchSessionRole();
  }, []); // Empty dependency array ensures this runs only once on mount

  const buttonHref = `/venues/${venueSlug}/${court.slug}`;

  // Logic to find the lowest price from the priceSlots array
  const lowestPrice = court.priceSlots?.reduce((min, slot) => {
    const price =
      typeof slot.price === "string" ? parseFloat(slot.price) : slot.price;
    return price < min ? price : min;
  }, Infinity);

  return (
    <div className="relative group rounded-2xl shadow-lg overflow-hidden bg-white border border-green-100 hover:border-green-300 hover:bg-green-50 w-full max-w-sm">
      {/* Court Image */}
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={imageUrl || "/default-court-image.jpg"}
          alt={court.name}
          fill
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        {/* Bottom gradient info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
          <h3 className="text-white font-bold text-lg line-clamp-1">
            {court.name}
          </h3>
          <p className="text-white/90 text-sm line-clamp-1">{venueName}</p>
        </div>

        {/* Hover overlay from bottom */}
        <div className="absolute inset-0 bg-black/70 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-center p-4 space-y-2 text-center rounded-2xl">
          <p className="text-white text-sm">
            <span className="font-semibold block text-gray-300">Sport</span>
            {court.sport ?? "N/A"}
          </p>
          <p className="text-white text-sm">
            <span className="font-semibold block text-gray-300">Price</span>
            {lowestPrice && lowestPrice !== Infinity
              ? `Starts at ₹${lowestPrice}/hr`
              : "N/A"}
          </p>
          <p className="text-white text-sm">
            <span className="font-semibold block text-gray-300">Timings</span>
            {court.openTime && court.closeTime
              ? `${court.openTime}:00 - ${court.closeTime}:00`
              : "N/A"}
          </p>
        </div>

        {/* Rating & Status Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]} transition-transform duration-300 group-hover:scale-105`}
          >
            {status}
          </span>
          <span className="bg-black/50 text-yellow-400 px-2 py-0.5 rounded-full text-xs flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Bottom button - Conditionally rendered after role is fetched */}
      {role === "USER" && (
        <div className="p-4 flex justify-center">
          <Link
            href={buttonHref}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-transform duration-300 hover:-translate-y-1"
          >
            View Court
          </Link>
        </div>
      )}
      {role === "OWNER" && (
        <div className="p-2 flex justify-center">
          <Link
            href={`/manager/venues/${venueSlug}/${court.slug}`}
            className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-5 py-1 md:py-2 rounded-lg font-medium transition-transform duration-300 hover:-translate-y-1"
          >
            Manage Court
          </Link>
        </div>
      )}
    </div>
  );
}
