// src/app/venues/page.tsx
import { Suspense } from "react";
import VenuesClient from "@/components/user/client-components/VenuesClient";
import { filterVenues as getFilteredVenues } from "@/app/(user)/_userActions/venues.actions";
import type { VenueFilters } from "@/types/next-auth";

type Props = {
  searchParams: {
    q?: string;
    city?: string;
    sport?: string;
    price?: string;
    rating?: string;
    page?: string;
    limit?: string;
    venueType?: string;
  };
};

export default async function VenuesPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 9;

  const filters: Partial<VenueFilters> = {
    q: searchParams.q ?? undefined,
    city: searchParams.city ?? undefined,
    sport: searchParams.sport ?? undefined,
    venueType: searchParams.venueType as "Indoor" | "Outdoor" | "All" | undefined,
    price: searchParams.price ? Number(searchParams.price) : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    page,
    limit,
  };

  const { venues, totalPages, currentPage } = await getFilteredVenues(filters);

  return (
    <Suspense fallback={<p className="text-gray-500">Loading venues...</p>}>
      <VenuesClient
        initialVenues={venues}
        initialFilters={filters}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </Suspense>
  );
}
