"use client";
import { useState, useEffect } from "react";
import { useVenues } from "@/app/context/VenuesContext";
// import FilterSidebar from "./client-components/FilterSidebar";
import VenueCard from "../../shared/VenueCard";
import { Venue } from "@/types/next-auth";
export default function VenuesContent() {
  const { venues } = useVenues();
  console.log("Veneus from venues content:", venues);
  // Local state to hold filtered venues
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>(venues);
  console.log("------------filtered-venues", filteredVenues);
  useEffect(() => {
    setFilteredVenues(venues);
  }, []);

  // This function will be passed to FilterSidebar
  const handleFilterChange = (filtered: Venue[]) => {
    setFilteredVenues(filtered);
  };

  return (
    <div className="flex md:flex-row gap-6 p-4">
      {/* <FilterSidebar venues={venues} onFilterChange={handleFilterChange} /> */}

      <div className="flex-1 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredVenues.map((v) => (
          <VenueCard key={v.slug} venue={v} />
        ))}
      </div>
    </div>
  );
}
