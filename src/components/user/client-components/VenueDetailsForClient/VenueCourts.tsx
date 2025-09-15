"use client";

import Link from "next/link";
import { Court } from "@/types/next-auth"; // adjust path if needed

interface VenueCourtsProps {
  courts: Court[];
  venueSlug: string;
}

export default function VenueCourts({ courts, venueSlug }: VenueCourtsProps) {
  if (!courts || courts.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No courts available for this venue.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courts.map((court) => (
        <div
          key={court.id}
          className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-200 flex flex-col"
        >
          <img
            src={court.imageUrl}
            alt={court.name}
            className="h-40 w-full object-cover"
          />

          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold text-gray-800">
              {court.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1">{court.sport}</p>
            <p className="text-sm text-gray-500 mb-1">Type: {court.type}</p>
            <p className="text-sm text-gray-500 mb-1">
              Rating: ⭐ {court.averageRating.toFixed(1)} ({court.reviewCount}{" "}
              reviews)
            </p>
            <p className="text-sm text-gray-700 font-medium mb-3">
              Starting at {court.priceSlots?.[0]?.pricePerHour ?? "—"}{" "}
              {court.currency}/hr
            </p>

            <div className="mt-auto">
              <Link
                href={`/venues/${venueSlug}/${court.slug}/booking/`}
                className="inline-block w-full text-center px-4 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
