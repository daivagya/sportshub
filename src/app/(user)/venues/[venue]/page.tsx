import type { Metadata } from "next";
import { getVenueBySlug } from "@/app/(user)/_userActions/venues.actions";
import VenueHeader from "@/components/user/client-components/VenueDetailsForClient/VenueHeader";
import VenueCourts from "@/components/user/client-components/VenueDetailsForClient/VenueCourts";
import VenueReviews from "@/components/user/client-components/VenueDetailsForClient/VenueReviews";
import NearbyVenues from "@/components/user/client-components/VenueDetailsForClient/NearbyVenues";
import VenueAmenities from "@/components/user/client-components/VenueDetailsForClient/VenueAmenities";

export async function generateMetadata({ params }: { params: { venue: string } }): Promise<Metadata> {
  const venueData = await getVenueBySlug(params.venue);
  return {
    title: venueData?.name ?? "Venue Details",
  };
}

export default async function VenuePage({ params }: { params: { venue: string } }) {
  const venueSlug = await params.venue;
  const venueData = await getVenueBySlug(venueSlug);
  console.log("Venue data-----from user/[venue]/page.tsx:", venueData);
  if (!venueData) {
    return (
      <div className="text-center py-20 text-gray-500">
        Venue not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <VenueHeader
          name={venueData.name}
          address={venueData.address}
          city={venueData.city}
          state={venueData.state}
          rating={4.7} // Replace with actual venueData.rating
        />

        {/* <VenueImagesAndDescription
          images={venueData.images || []}
          description={venueData.description}
        /> */}
        <VenueAmenities amenities={venueData.amenities || []} />
        <VenueCourts courts={venueData.courts || []} />

        <VenueReviews />
        <NearbyVenues />
      </div>
    </div>
  );
}
