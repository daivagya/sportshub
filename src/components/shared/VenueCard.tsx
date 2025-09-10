"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Clock, Users, Wifi, Car } from "lucide-react";
import { Venue } from "@/types/next-auth";
import { memo } from "react";

interface VenueCardProps {
  venue: Venue;
  href?: string;
}

// Helper function to format price
const formatPrice = (priceInPaisa: number): string => {
  const rupees = Math.round(priceInPaisa / 100);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
};

// Helper function to get amenity icons
const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, any> = {
    wifi: Wifi,
    parking: Car,
    locker: Users,
  };

  const IconComponent = iconMap[amenity.toLowerCase()] || Users;
  return <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-300" />;
};

function VenueCard({ venue, href }: VenueCardProps) {
  // Calculate pricing from courts
  const courts = venue?.courts ?? [];

  // Get unique sports from courts
  const uniqueSports = courts.length > 0 ? [...new Set(courts.map((c) => c.sport).filter(Boolean))] : [];

  // Fallback image
  const imageUrl = venue?.photos?.[0] ?? "/images/placeholder-venue.jpg";
  const venueName = venue?.name ?? "Unnamed Venue";
  const venueAddress = venue?.address ?? "Address not available";
  const venueSlug = venue?.slug?? "";

  // Determine the correct href
  const linkHref = href ?? `/venues/${venueSlug}`;
  const linkText = href ? "Manage details" : "View details";
  const linkAriaLabel = href ? `Manage details for ${venueName}` : `View details for ${venueName}`;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col w-full max-w-sm transition-transform hover:scale-105">
      {/* Image */}
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={venueName}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 400px"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name & Address */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
          {venueName}
        </h3>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1 gap-1">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{venueAddress}</span>
        </div>


        {/* Sports Tags */}
        {uniqueSports.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {uniqueSports.map((sport) => (
              <span
                key={sport}
                className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
              >
                {sport}
              </span>
            ))}
          </div>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {venue.amenities.map((a) => (
              <div key={a} className="flex items-center gap-1 text-gray-600 dark:text-gray-300 text-xs">
                {getAmenityIcon(a)}
                <span className="capitalize">{a}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <Link
            href={linkHref}
            aria-label={linkAriaLabel}
            className="block text-center bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium transition"
          >
            {linkText}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(VenueCard);