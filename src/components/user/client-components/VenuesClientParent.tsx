"use client";
import { useState, useEffect } from "react";
import { useVenues } from "@/app/context/VenuesContext";
import FilterSidebar from "./FilterSidebar";
import VenueCard from "@/components/shared/VenueCard";
import { Venue } from "@/types/next-auth";

export default function VenuesContent() {
  const { venues, isLoading } = useVenues();
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);

  useEffect(() => {
    // When the main venues list from context changes, update the filtered list
    setFilteredVenues(venues);
  }, [venues]);

  const handleFilterChange = (filtered: Venue[]) => {
    setFilteredVenues(filtered);
  };

  // Display a loading state while fetching initial data
  if (isLoading) {
    return <div className="text-center p-10">Loading venues...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 md:p-6 items-start">
      <FilterSidebar venues={venues} onFilterChange={handleFilterChange} />
      <div className="flex-1">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 items-start">
          {filteredVenues && filteredVenues.length > 0 ? (
            filteredVenues.map((v) => <VenueCard key={v.slug} venue={v} />)
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No venues match the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
