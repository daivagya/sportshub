"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import type { Venue } from "@/types/next-auth";
import type { VenueFilters } from "@/types/next-auth";
import GAMES from "@/constants/games";
import { filterVenues } from "@/app/(user)/_userActions/venues.actions";

type Props = {
  onFilterChange: (venues: Venue[]) => void;
  initialFilters?: Partial<VenueFilters>;
  initialVenues?: Venue[]; // used for reset
};

const SPORTS_OPTIONS = GAMES;
const MAX_PRICE = 5500;

export default function FilterSidebar({
  onFilterChange,
  initialFilters,
  initialVenues,
}: Props) {
  // committed filters (safe defaults)
  const [filters, setFilters] = useState<VenueFilters>({
    q: initialFilters?.q ?? "",
    sport: initialFilters?.sport ?? "",
    price: initialFilters?.price ?? MAX_PRICE,
    venueType: initialFilters?.venueType ?? "All",
    rating: initialFilters?.rating ?? 0,
    city: initialFilters?.city ?? "",
  });

  // slider live value
 const [tempPrice, setTempPrice] = useState<number>(filters.price ?? MAX_PRICE);

  // transition state
  const [isPending, startTransition] = useTransition();

  // detect active filters
  const hasActiveFilters = useMemo(() => {
    return (
      filters.q?.trim() !== "" ||
      filters.sport !== "" ||
      filters.price !== MAX_PRICE ||
      filters.venueType !== "All" ||
      filters.rating !== 0 ||
      filters.city?.trim() !== ""
    );
  }, [filters]);

  // generic change handler
  const handleInputChange = useCallback(
    (field: keyof VenueFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // commit price slider
  const commitPrice = useCallback(() => {
    setFilters((prev) => ({ ...prev, price: tempPrice }));
  }, [tempPrice]);

  // apply filters
  const applyFilters = useCallback(() => {
    const applied: Partial<VenueFilters> = {
      q: filters.q?.trim() || undefined,
      city: filters.city?.trim() || undefined,
      sport: filters.sport || undefined,
      venueType: filters.venueType === "All" ? undefined : filters.venueType,
      rating: filters.rating || undefined,
      price: filters.price !== MAX_PRICE ? filters.price : undefined,
    };

    startTransition(async () => {
      try {
        const result = await filterVenues(applied);
        onFilterChange(result?.venues ?? []);
      } catch (err: any) {
        console.error("Filter action failed:", err);
        alert(err?.message ?? "Failed to apply filters");
      }
    });
  }, [filters, onFilterChange]);

  // clear filters
  const clearFilters = useCallback(() => {
    const reset: VenueFilters = {
      q: "",
      sport: "",
      price: MAX_PRICE,
      venueType: "All",
      rating: 0,
      city: "",
    };
    setFilters(reset);
    setTempPrice(MAX_PRICE);

    startTransition(async () => {
      try {
        if (initialVenues) {
          // show initial venues without hitting server
          onFilterChange(initialVenues);
        } else {
          // fallback: fetch all venues from server
          const result = await filterVenues({});
          onFilterChange(result?.venues ?? []);
        }
      } catch (err: any) {
        console.error("Clear filter failed:", err);
        alert("Failed to fetch venues");
      }
    });
  }, [initialVenues, onFilterChange]);

  // enter key triggers apply
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 p-6 bg-white border-r border-gray-200">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <div className="text-sm text-gray-600">
            {hasActiveFilters ? (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-50 rounded text-xs">
                No filters
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Search by venue name
          </label>
          <input
            value={filters.q ?? ""}
            onChange={(e) => handleInputChange("q", e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search for venue"
            aria-label="Search venues"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm 
              focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-green-500 transition"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            City
          </label>
          <input
            value={filters.city ?? ""}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="Enter city"
            aria-label="Filter by city"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm 
              focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-green-500 transition"
          />
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Sport
          </label>
          <select
            value={filters.sport ?? ""}
            onChange={(e) => handleInputChange("sport", e.target.value)}
            aria-label="Filter by sport"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm 
              focus:outline-none focus:ring-2 focus:ring-green-500 
              focus:border-green-500 transition"
          >
            <option value="">All sports</option>
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
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              step={100}
              value={tempPrice}
              onChange={(e) => setTempPrice(Number(e.target.value))}
              aria-label="Price range slider"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <button
              type="button"
              onClick={commitPrice}
              title="Set price"
              className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Set
            </button>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>₹ 0</span>
            <span>₹ {tempPrice.toLocaleString()}</span>
          </div>
          {filters.price !== MAX_PRICE && (
            <div className="mt-2 text-xs text-gray-700">
              Committed price:{" "}
              <strong>₹ {filters.price!.toLocaleString()}</strong>
            </div>
          )}
        </div>

        {/* Venue type */}
        <div>
          <h4 className="block text-sm font-semibold text-gray-800 mb-2">
            Venue Type
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
                <span className="text-sm">{type}</span>
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
                <span className="text-sm">{star} stars & up</span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={applyFilters}
            disabled={isPending || !hasActiveFilters}
            className={`w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
              hasActiveFilters
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            aria-disabled={isPending || !hasActiveFilters}
          >
            {isPending ? "Applying..." : "Apply"}
          </button>

          <button
            onClick={clearFilters}
            disabled={isPending}
            className="w-full px-4 py-2 border border-red-500 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </aside>
  );
}
