"use client";

import React from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
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

export default function CourtCard({
  court,
  venueName,
  venueSlug,
  venueId,
  status,
  rating,
  imageUrl,
}: CourtCardProps) {
  const { data: session } = useSession();
  console.log(session);
  const role = session?.user?.role;

  const isManager = role === "MANAGER";
  const buttonText = venueId ? "See Details" : "View More";
  const buttonHref = venueId
    ? `/manager/venues/${venueSlug}/courts/${court.slug}`
    : `/courts/${court.slug}`;

  return (
    <div className="relative group rounded-xl shadow-lg overflow-hidden bg-white w-full max-w-sm">
      {/* Image Section */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={court.name}
          className="object-cover w-full h-56 transition-transform duration-300 group-hover:scale-105"
        />

        {/* Always Visible Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <h3 className="text-white font-semibold text-lg">{court.name}</h3>
          <p className="text-white/80 text-sm">{venueName}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center text-yellow-400 text-sm font-medium">
              <Star className="w-4 h-4 mr-1 fill-current" /> {rating}
            </span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                status === "CONFIRMED"
                  ? "bg-red-600 text-white"
                  : status === "PENDING"
                  ? "bg-yellow-500 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4">
          <p className="text-sm">
            <span className="font-semibold">Sport:</span> {court.sport ?? "N/A"}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Price:</span>{" "}
            {court.pricePerHour ? `₹${court.pricePerHour}/hr` : "N/A"}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Timings:</span>{" "}
            {court.openTime && court.closeTime
              ? `${court.openTime}:00 - ${court.closeTime}:00`
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Bottom Section - View More */}
      {/* Bottom Section - Role-based button */}
      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <span className="text-sm text-gray-700">
          {isManager
            ? "Manage and see more details of this court."
            : "Want to know more about this court?"}
        </span>
        <Link
          href={buttonHref}
          className="px-4 py-1.5 text-sm font-medium rounded-lg border border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
