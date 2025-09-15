"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Swords } from "lucide-react";
import { memo, useMemo } from "react";

interface VenueCardProps {
  venue: {
    name: string;
    slug: string;
    address?: string;
    photos?: string[];
    courts?: {
      sport: string;
      priceSlots: string[];
    }[];
    rating?: number;
  };
  href?: string;
}

function VenueCard({ venue, href }: VenueCardProps) {
  const {
    uniqueSports,
    courtCount,
    imageUrl,
    venueName,
    venueAddress,
    rating,
    linkHref,
  } = useMemo(() => {
    const courts = venue?.courts ?? [];
    const photos = venue?.photos ?? [];
    const uniqueSports =
      courts.length > 0
        ? [...new Set(courts.map((c) => c.sport).filter(Boolean))]
        : [];

    return {
      uniqueSports,
      courtCount: courts.length,
      imageUrl: photos[0] ?? "/images/placeholder-venue.jpg",
      venueName: venue?.name ?? "Unnamed Venue",
      venueAddress: venue?.address ?? "Address not available",
      rating: venue?.rating,
      linkHref: href ?? `/venues/${venue?.slug ?? ""}`,
    };
  }, [venue, href]);

  return (
    <div className="group rounded-xl shadow-md overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-800 border border-transparent hover:border-green-300 dark:border-gray-700">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={venueName}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 60vw, (max-width: 1024px) 47vw, 32vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {rating && (
          <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}

        {uniqueSports.length > 0 && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 transition-all duration-500 flex flex-col justify-center items-center gap-2 p-4">
            <p className="text-white font-semibold mb-1">Available Sports</p>
            <div className="flex flex-wrap justify-center gap-2">
              {uniqueSports.slice(0, 3).map((sport) => (
                <span
                  key={sport}
                  className="bg-white text-gray-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-2 flex-1 flex flex-col justify-between relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-green-50 to-transparent dark:from-green-900/20 pointer-events-none"
        />

        <div className="relative">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {venueName}
          </h3>
          <p className="flex items-start text-gray-500 dark:text-gray-400 text-sm mt-1 gap-1.5 h-10 line-clamp-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{venueAddress}</span>
          </p>
          <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300  border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Swords className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">
                {courtCount} {courtCount === 1 ? "Court" : "Courts"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 relative">
          <Link
            href={linkHref}
            className="block text-center bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 font-bold transition-colors"
          >
            See details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(VenueCard);
