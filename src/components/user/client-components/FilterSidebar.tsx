"use client";

import { useState, useMemo, useCallback } from "react";
import { Venue, VenueFilters } from "@/types/next-auth";
import GAMES from "@/constants/games";

type Props = {
  venues: Venue[];
  onFilterChange: (filtered: Venue[]) => void;
};

const SPORTS_OPTIONS = GAMES;

export default function FilterSidebar({ venues = [], onFilterChange }: Props) {
  const [filters, setFilters] = useState<VenueFilters>({
    q: "",
    sport: "",
    price: 5500,
    venueType: "All",
    rating: 0,
  });

  const [tempPrice, setTempPrice] = useState(filters.price);

  // ✅ Determine if user has selected at least one filter
  const hasActiveFilters = useMemo(() => {
    return (
      filters.q.trim() !== "" ||
      filters.sport !== "" ||
      filters.price !== 5500 || // if not max price
      filters.venueType !== "All" ||
      filters.rating !== 0
    );
  }, [filters]);

  // ✅ Filtering logic (runs only when Apply is clicked)
  const getFilteredVenues = useCallback(
    (activeFilters: VenueFilters) => {
      return venues.filter((v) => {
        const matchesQuery =
          !activeFilters.q ||
          v.name?.toLowerCase().includes(activeFilters.q.toLowerCase());
        const matchesSport =
          !activeFilters.sport || v.sport === activeFilters.sport;
        const matchesPrice = (v.price ?? 0) <= activeFilters.price;
        const matchesVenueType =
          activeFilters.venueType === "All" ||
          v.venueType === activeFilters.venueType;
        const matchesRating =
          activeFilters.rating === 0 || (v.rating ?? 0) >= activeFilters.rating;

        return (
          matchesQuery &&
          matchesSport &&
          matchesPrice &&
          matchesVenueType &&
          matchesRating
        );
      });
    },
    [venues]
  );

  // ✅ Handle input changes
  const handleInputChange = useCallback(
    (field: keyof VenueFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // ✅ Clear all filters
  const clearFilters = () => {
    const resetFilters: VenueFilters = {
      q: "",
      sport: "",
      price: 5500,
      venueType: "All",
      rating: 0,
    };
    setFilters(resetFilters);
    setTempPrice(5500);
    onFilterChange(venues); // Reset to full list
  };

  // ✅ Apply filters only when button is clicked
  const applyFilters = () => {
    const updated = { ...filters, price: tempPrice };
    setFilters(updated); // sync state
    const filtered = getFilteredVenues(updated);
    onFilterChange(filtered);
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 p-6 bg-white border-r border-gray-200">
      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Search by venue name
          </label>
          <input
            value={filters.q}
            onChange={(e) => handleInputChange("q", e.target.value)}
            placeholder="Search for venue"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Filter by sport type
          </label>
          <select
            value={filters.sport}
            onChange={(e) => handleInputChange("sport", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          >
            <option value="">Select a sport</option>
            {SPORTS_OPTIONS.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Price range (per hour)
          </label>
          <input
            type="range"
            min="0"
            max="5500"
            step="100"
            value={tempPrice}
            onChange={(e) => setTempPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>₹ 0</span>
            <span>₹ {tempPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Venue Type */}
        <div>
          <h4 className="block text-sm font-semibold text-gray-800 mb-2">
            Choose Venue Type
          </h4>
          <div className="flex space-x-4">
            {["All", "Indoor", "Outdoor"].map((type) => (
              <label
                key={type}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="venueType"
                  value={type}
                  checked={filters.venueType === type}
                  onChange={() => handleInputChange("venueType", type)}
                  className="form-radio text-green-600"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="block text-sm font-semibold text-gray-800 mb-2">
            Rating
          </h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((star) => (
              <label
                key={star}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.rating === star}
                  onChange={() =>
                    handleInputChange(
                      "rating",
                      filters.rating === star ? 0 : star
                    )
                  }
                  className="form-checkbox text-green-600 rounded"
                />
                <span>{star} stars & up</span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply */}
        <button
          onClick={applyFilters}
          disabled={!hasActiveFilters}
          className={`mt-3 w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
            hasActiveFilters
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Apply
        </button>

        {/* Clear */}
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 border border-red-500 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </aside>
  );
}
