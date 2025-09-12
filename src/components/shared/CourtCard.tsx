"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

// --- REFACTORED TYPES ---
// By defining types separately, they become reusable and the code is cleaner.
export type Court = {
  name: string;
  slug: string;
  sport?: string;
  pricePerHour?: number;
  openTime?: number;
  closeTime?: number;
};

export type CourtStatus = "CONFIRMED" | "PENDING" | "AVAILABLE";

export type CourtCardProps = {
  court: Court;
  venueName: string;
  venueSlug: string;
  status: CourtStatus;
  rating: number;
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
  rating,
  imageUrl,
}: CourtCardProps) {
  // FIX: Used template literal (backticks) for correct URL construction.
  // Also assumed a more complete URL structure for better navigation.
  const buttonHref = `/venues/${venueSlug}/courts/${court.slug}`;

  return (
    <div className="relative group rounded-2xl shadow-lg overflow-hidden bg-white border dark:border-gray-700 dark:bg-gray-800 w-full max-w-sm">
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
            {/* FIX: Used template literal for string interpolation */}
            {court.pricePerHour ? `₹${court.pricePerHour}/hr` : "N/A"}
          </p>
          <p className="text-white text-sm">
            <span className="font-semibold block text-gray-300">Timings</span>
            {/* FIX: Used template literal for string interpolation */}
            {court.openTime && court.closeTime
              ? `${court.openTime}:00 - ${court.closeTime}:00`
              : "N/A"}
          </p>
        </div>

        {/* Rating & Status Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span
            // FIX: Used template literal to correctly apply dynamic classes
            className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]} transition-transform duration-300 group-hover:scale-105`}
          >
            {status}
          </span>
          <span className="bg-black/50 text-yellow-400 px-2 py-0.5 rounded-full text-xs flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Bottom button */}
      <div className="p-4 flex justify-center">
        <Link
          href={buttonHref}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-transform duration-300 hover:-translate-y-1"
        >
          View Court
        </Link>
      </div>
    </div>
  );
}