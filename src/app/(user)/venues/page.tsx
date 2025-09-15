import { Suspense } from "react";
import VenuesClient from "@/components/user/client-components/VenuesClient";
import { filterVenues } from "../_userActions/venues.actions";
import type { VenueFilters } from "@/types/next-auth";

type Props = {
  // This 'searchParams' prop is automatically populated by Next.js
  // with the parameters from the URL, like ?city=Surat&sport=Cricket
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

  // This is the key part for handling the search.
  // We build a 'filters' object directly from the URL's searchParams.
  // If the URL has `?city=Surat`, then `filters.city` will be "Surat".
  const filters: Partial<VenueFilters> = {
    q: searchParams.q ?? undefined,
    city: searchParams.city ?? undefined,
    sport: searchParams.sport ?? undefined,
    venueType: searchParams.venueType as
      | "Indoor"
      | "Outdoor"
      | "All"
      | undefined,
    price: searchParams.price ? Number(searchParams.price) : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    page,
    limit,
  };
  console.log("City from venues/page.tsx:", filters.city);
  // The server action is then called with these filters.
  // This fetches only the venues that match the city from the search input.
  const { venues, totalPages, currentPage } = await filterVenues(filters);
  console.log("Venues for a city--------->", venues);
  return (
    // The Suspense boundary shows a loading skeleton while the data is being fetched.
    <Suspense fallback={<LoadingState />}>
      {/* The fetched data and the initial filters are passed to the client component. */}
      <VenuesClient
        initialVenues={venues}
        initialFilters={filters}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </Suspense>
  );
}

// A simple skeleton loader for the entire page content.
const LoadingState = () => (
  <div className="container mx-auto flex flex-col md:flex-row gap-8 py-8">
    {/* Sidebar Skeleton */}
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 p-6">
      <div className="space-y-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2 mb-6">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
        <div className="h-12 bg-gray-300 rounded w-full mt-6"></div>
        <div className="h-10 border border-gray-300 rounded w-full"></div>
      </div>
    </aside>
    {/* Main Content Skeleton */}
    <main className="flex-grow">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full h-80 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </main>
  </div>
);
