"use client";

import { useState, useEffect } from "react";
import { Venue } from "@/types/next-auth";

export type VenueFilters = {
  q: string;
  sport: string;
  minPrice: number;
  maxPrice: number;
  venueType: "All" | "Indoor" | "Outdoor";
  rating: number | null;
};

type Props = {
  venues: Venue[];
  onFilterChange: (filtered: Venue[]) => void; // <-- add this
};

export default function FilterSidebar({ venues, onFilterChange }: Props) {
  const [filters, setFilters] = useState<VenueFilters>({
    q: "",
    sport: "All",
    minPrice: 0,
    maxPrice: 5500,
    venueType: "All",
    rating: null,
  });

  // Whenever filters change, update the filtered venues
  useEffect(() => {
    const filtered = venues.filter((v) => {
      // Filter by name
      const matchesQuery = v.name
        .toLowerCase()
        .includes(filters.q.toLowerCase());
      // Filter by venue type if you have it
      // const matchesType =
      //   filters.venueType === "All" || v.venueType === filters.venueType;
      // Filter by rating if you have it
      // const matchesRating =
      //   !filters.rating || (v.rating ?? 0) >= filters.rating;

      // return matchesQuery && matchesType && matchesRating;
    });

    onFilterChange(filtered); // <-- call parent callback
  }, [filters, venues, onFilterChange]);

  const handleInputChange = (field: keyof VenueFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      sport: "All",
      minPrice: 0,
      maxPrice: 5500,
      venueType: "All",
      rating: null,
    });
  };

  return (
    <aside className="w-80 h-screen sticky top-0 bg-white shadow-lg rounded-2xl p-6 overflow-y-auto">
      <div className="mb-6">
        <label
          htmlFor="search-venue"
          className="block text-sm font-semibold text-gray-800 mb-2"
        >
          Search by venue name
        </label>
        <input
          id="search-venue"
          value={filters.q}
          onChange={(e) => handleInputChange("q", e.target.value)}
          placeholder="Search for venue"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      {/* Add other filters here if needed */}

      <button
        onClick={clearFilters}
        className="w-full px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
      >
        Clear Filters
      </button>
    </aside>
  );
}
