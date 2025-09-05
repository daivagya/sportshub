"use client";

import { useState, useEffect } from "react";
import { Venue } from "@/lib/dummyData";

// Define the shape of the filters this component will manage
export type VenueFilters = {
  q: string;
  sport: string;
  minPrice: number;
  maxPrice: number;
  venueType: "All" | "Indoor" | "Outdoor";
  rating: number | null;
};

type Props = {
  venues: Venue[]; // Needed to calculate dynamic values like price range
};

export default function FilterSidebar({ venues}: Props) {
  // Dynamically get available sports and price ranges from the data
  // FIX: Add a fallback `|| []` to prevent crash if `venues` is undefined on first render.
  const sportSet = Array.from(
    new Set((venues || []).flatMap((v) => v.courts.map((c) => c.sport)))
  );
  const allPrices = (venues || []).flatMap((v) =>
    v.courts.map((c) => Math.round(c.pricePerHour))
  );
  const minAvailable = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxAvailable = allPrices.length > 0 ? Math.max(...allPrices) : 5500; // Default max if no prices

  // Local state for each filter input
  const [filters, setFilters] = useState<VenueFilters>({
    q: "",
    sport: "All",
    minPrice: minAvailable,
    maxPrice: maxAvailable,
    venueType: "All",
    rating: null,
  });

  // When any filter changes, call the parent's onFilterChange function
  // useEffect(() => {
  //   // FIX: Add a check to ensure onFilterChange is a function before calling it.
  //   // This prevents a crash if the prop isn't passed from the parent component.
  //   if (typeof onFilterChange === "function") {
  //     onFilterChange(filters);
  //   }
  // }, [filters, onFilterChange]);

  const handleInputChange = (field: keyof VenueFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      sport: "All",
      minPrice: minAvailable,
      maxPrice: maxAvailable,
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

      <div className="mb-6">
        <label
          htmlFor="sport-type"
          className="block text-sm font-semibold text-gray-800 mb-2"
        >
          Filter by sports type
        </label>
        <select
          id="sport-type"
          value={filters.sport}
          onChange={(e) => handleInputChange("sport", e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        >
          <option value="All">All Sports</option>
          {sportSet.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Price range (per hour)
        </label>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>₹{filters.minPrice}</span>
          <span>₹{maxAvailable}</span>
        </div>
        <input
          type="range"
          min={minAvailable}
          max={maxAvailable}
          value={filters.minPrice}
          onChange={(e) =>
            handleInputChange("minPrice", Number(e.target.value))
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
      </div>

      <div className="mb-6">
        <h4 className="block text-sm font-semibold text-gray-800 mb-3">
          Choose Venue Type
        </h4>
        <div className="space-y-2">
          {["All", "Indoor", "Outdoor"].map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="radio"
                name="vtype"
                checked={filters.venueType === type}
                onChange={() =>
                  handleInputChange(
                    "venueType",
                    type as "All" | "Indoor" | "Outdoor"
                  )
                }
                className="form-radio h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="block text-sm font-semibold text-gray-800 mb-3">
          Rating
        </h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.rating === r}
                onChange={() =>
                  handleInputChange("rating", filters.rating === r ? null : r)
                }
                className="form-checkbox h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span>{r} stars & up</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
      >
        Clear Filters
      </button>
    </aside>
  );
}
