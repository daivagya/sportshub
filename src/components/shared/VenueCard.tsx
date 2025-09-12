"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, IndianRupee, Swords } from "lucide-react";
import { memo, useMemo } from "react";

// REFACTORED: Props now include rating and price data for a richer display
interface VenueCardProps {
  venue: {
    name: string;
    slug: string;
    address?: string;
    photos?: string[];
    courts?: {
      sport: string;
      pricePerHour?: number; // Added for price range calculation
    }[];
    rating?: number; // Added for rating display
  };
  href?: string;
}

export default memo(function VenueCard({ venue, href }: VenueCardProps) {
  // --- Data Processing using useMemo for performance ---
  const {
    uniqueSports,
    courtCount,
    priceRange,
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

    const prices = courts
      .map((c) => c.pricePerHour)
      .filter((p): p is number => p != null && p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    let priceRange = "Pricing not available";
    if (minPrice > 0 && maxPrice > 0) {
      priceRange =
        minPrice === maxPrice
          ? `₹${minPrice}/hr`
          : `₹${minPrice} - ₹${maxPrice}/hr`;
    }

    // FIX: Corrected template literal syntax
    const linkHref = href ?? `/venues/${venue?.slug ?? ""}`;

    return {
      uniqueSports,
      courtCount: courts.length,
      priceRange,
      imageUrl: photos[0] ?? "/images/placeholder-venue.jpg",
      venueName: venue?.name ?? "Unnamed Venue",
      venueAddress: venue?.address ?? "Address not available",
      rating: venue?.rating,
      linkHref,
    };
  }, [venue, href]);

  return (
    // ENHANCEMENT: Added transition-all and more prominent hover effects to the whole card
    <article className="relative group rounded-xl shadow-md overflow-hidden bg-white dark:bg-gray-800 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* --- Image Container --- */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={venueName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* NEW: Rating badge, z-10 keeps it visible above the hover overlay */}
        {rating && (
          <div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}

        {/* PRESERVED: The original slide-up sports overlay and animation */}
        {uniqueSports.length > 0 && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 transition-all duration-500 flex flex-col justify-center items-center gap-2 p-4">
            <p className="text-white font-semibold mb-1">Available Sports</p>
            <div className="flex flex-wrap justify-center gap-2">
              {uniqueSports.slice(0, 3).map((sport) => (
                <span
                  key={sport}
                  className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full font-medium"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- Info & Action Container --- */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
            {venueName}
          </h3>
          <p className="flex items-start text-gray-500 dark:text-gray-400 text-sm mt-1 gap-1.5 line-clamp-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{venueAddress}</span>
          </p>

          {/* NEW: Meta info section for key details */}
          <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 mt-3 border-t dark:border-gray-700 pt-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Swords className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">
                {courtCount} {courtCount === 1 ? "Court" : "Courts"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <IndianRupee className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">{priceRange}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href={linkHref}
            className="block text-center bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 text-sm font-bold transition-colors"
          >
            See details
          </Link>
        </div>
      </div>
    </article>
  );
}); 