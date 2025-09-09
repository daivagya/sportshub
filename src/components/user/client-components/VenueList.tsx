"use client";

import { useEffect } from "react";
import VenueCard from "@/components/shared/VenueCard"; // adjust import based on your project
import { Venue } from "@/types/next-auth";

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
}

export default function VenueList({ venues, isLoading }: VenueListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Simple loading skeletons */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No venues available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <VenueCard key={venue.slug} venue={venue} />
      ))}
    </div>
  );
}
