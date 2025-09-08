import React from "react";
import { getOwnedVenues } from "@/app/(owner)/manager/_actions/venue.actions";
import VenueCard from "@/components/shared/VenueCard";
export const dynamic = "force-dynamic";

export default async function OwnedVenuesContent() {
  try {
    // 1. Call the server action
    const response = await getOwnedVenues();

    // 2. Parse JSON if it's a Response
    const data =
      response instanceof Response ? await response.json() : response;

    // 3. Handle error from API
    if (data?.error) {
      return (
        <div className="flex justify-center items-center h-40 text-red-500 font-semibold">
          {data.error}
        </div>
      );
    }

    const venues = data ?? [];

    // 4. Empty state
    if (venues.length === 0) {
      return (
        <div className="flex justify-center items-center h-40 text-gray-500 font-medium">
          You don’t have any venues yet.
        </div>
      );
    }

    // 5. Render grid
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {venues.map((venue: any) => (
          <VenueCard
            key={venue.slug}
            venue={venue}
            href={`/manager/venues/${venue.slug}`}
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error rendering owned venues:", error);
    return (
      <div className="flex justify-center items-center h-40 text-red-500 font-semibold">
        Failed to load venues. Please try again later.
      </div>
    );
  }
}
