"use client";

import React from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Import the Next.js Image component

type CourtCardProps = {
  court: {
    name: string;
    sport?: string;
    pricePerHour?: number;
    openTime?: number;
    closeTime?: number;
    slug: string;
  };
  venueName: string;
  venueSlug: string;
  venueId?: number;
  status: "CONFIRMED" | "PENDING" | "AVAILABLE";
  rating: number;
  imageUrl: string;
};

// Helper object for cleaner status styling
const STATUS_STYLES = {
  CONFIRMED: "bg-red-600 text-white",
  PENDING: "bg-yellow-500 text-white",
  AVAILABLE: "bg-green-600 text-white",
};

export default function CourtCard({
  court,
  venueName,
  venueSlug,
  venueId,
  status,
  rating,
  imageUrl,
}: CourtCardProps) {
  // Determine button text and link based on whether it's for a manager or a user
  const isManagerView = !!venueId;
  const buttonText = isManagerView ? "Manage Details" : "View Court";
  const buttonHref = isManagerView
    ? `/manager/venues/${venueSlug}/${court.slug}`
    : `/courts/${court.slug}`;

  return (
    <div className="relative group rounded-xl shadow-lg overflow-hidden bg-white w-full max-w-sm border dark:border-gray-700 dark:bg-gray-800">
      {/* 1. Image Section with Next.js Image Optimization */}
      <div className="relative w-full h-56">
        <Image
          src={imageUrl || "/default-court-image.jpg"} // Added a fallback image
          alt={court.name}
          fill
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={true}
        />

        {/* Info Gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <h3 className="text-white font-bold text-lg tracking-tight">
            {court.name}
          </h3>
          <p className="text-white/90 text-sm">{venueName}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center text-yellow-400 text-sm font-medium">
              <Star className="w-4 h-4 mr-1.5 fill-current" />{" "}
              {rating.toFixed(1)}
            </span>
            {/* 2. Cleaner Status Badge */}
            <span
              className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${STATUS_STYLES[status]}`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Hover Overlay with Details */}
        <div className="absolute inset-0 bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 space-y-2 text-center">
          <p className="text-base">
            <span className="font-semibold block text-gray-300">Sport</span>{" "}
            {court.sport ?? "N/A"}
          </p>
          <p className="text-base">
            <span className="font-semibold block text-gray-300">Price</span>
            {court.pricePerHour ? `₹${court.pricePerHour}/hr` : "N/A"}
          </p>
          <p className="text-base">
            <span className="font-semibold block text-gray-300">Timings</span>
            {court.openTime && court.closeTime
              ? `${court.openTime}:00 - ${court.closeTime}:00`
              : "N/A"}
          </p>
        </div>
      </div>

      {/* 3. Bottom Section with Enhanced Button */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end items-center">
        <Link
          href={buttonHref}
          className={`
            px-5 py-2 text-sm font-semibold rounded-lg shadow-sm
            transition-all duration-300 ease-in-out transform
            hover:-translate-y-0.5 hover:shadow-lg focus:outline-none 
            focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800
            ${
              isManagerView
                ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500"
                : "bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-500"
            }
          `}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
