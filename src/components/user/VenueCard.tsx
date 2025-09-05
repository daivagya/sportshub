// components/user/VenueCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { Venue } from "@/lib/dummyData";

export default function VenueCard({ venue }: { venue: Venue }) {
  const courts = venue?.courts ?? [];
  const minPaisa =
    courts.length > 0
      ? Math.min(...courts.map((c) => c.pricePerHour))
      : undefined;
  const minRupees = minPaisa ? Math.round(minPaisa / 100) : undefined;

  return (
    <article className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition group">
      {/* IMAGE */}
      <div className="relative h-56 w-full">
        <Image
          src={venue?.photos?.[0] ?? "/images/placeholder-venue.jpg"}
          alt={venue?.name ?? "Venue"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />

        {/* DARK GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* TOP LEFT — Rating */}
        {venue?.rating && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-sm font-semibold shadow">
            <Star className="w-4 h-4 text-yellow-400" />{" "}
            {venue.rating.toFixed(1)}
          </div>
        )}

        {/* BOTTOM OVERLAY CONTENT */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-semibold truncate">
            {venue?.name ?? "Unnamed Venue"}
          </h3>
          <p className="text-sm flex items-center truncate text-gray-200">
            <MapPin className="inline w-4 h-4 mr-1 text-green-400" />{" "}
            {venue?.address ?? "Address not available"}
          </p>

          {/* Sport Tags */}
          <div className="mt-2 flex flex-wrap gap-2">
            {courts.slice(0, 3).map((c) => (
              <span
                key={c.id}
                className="text-xs px-2 py-1 bg-green-600/80 text-white rounded-full font-medium"
              >
                {c.sport}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILS SECTION (outside image, clean footer) */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {minRupees ? `₹${minRupees}/hr` : "Price not set"}
          </div>
        </div>
        <Link
          href={`/venues/${venue?.slug ?? ""}`}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white font-medium hover:bg-green-700 transition"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}