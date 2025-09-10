// components/user/client-components/VenuesClient.tsx
"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import type { Venue, VenueFilters } from "@/types/next-auth";
import FilterSidebar from "./FilterSidebar";
import VenueList from "./VenueList";

type Props = {
  initialVenues: Venue[];
  initialFilters?: Partial<VenueFilters>;
  totalPages?: number;
  currentPage?: number;
  clientSlug?: string;
};

export default function VenuesClient({
  initialVenues,
  initialFilters = {},
  totalPages = 1,
  currentPage = 1,
}: Props) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues ?? []);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(currentPage);

  // Keep local venues in sync if server re-hydrates
  useEffect(() => {
    setVenues(initialVenues ?? []);
    setPage(currentPage);
  }, [initialVenues, currentPage]);

  // callback passed to FilterSidebar (client)
  const handleFilterChange = useCallback((filtered: Venue[]) => {
    startTransition(() => {
      setVenues(filtered);
      setPage(1); // reset page when filters change
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    // If you later implement server action pagination, trigger fetch here
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* --- Sidebar --- */}
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
        <FilterSidebar
          onFilterChange={handleFilterChange}
          initialFilters={initialFilters}
          initialVenues={initialVenues}
        />
      </aside>

      {/* --- Main Venue List --- */}
      <main className="flex-1">
        <VenueList
          venues={venues}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}
