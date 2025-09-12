
import React from "react";
 
import Footer from "@/components/shared/Footer";
import Hero from "@/components/user/client-components/HeroSection";
import VenueSlider from "@/components/user/client-components/VenueSlider";
import { Court } from "@/types/next-auth";
import SportsWeOffer from "@/components/user/client-components/SportsWeOffer";
import CourtCard from "@/components/shared/CourtCard";
import { getCourts } from "@/app/(user)/_userActions/court.actions";
async function Page() {
  // Fetch the first 10 courts on the server
  const courts: Court[] = await getCourts(10);
 
  return (
    <div className="min-h-screen relative">
      <Hero />
      <div className="container mx-auto px-4 space-y-2.5">
        <VenueSlider />
        <CourtSlider courts={courts} />
        <SportsWeOffer />
      </div>
      <Footer />
    </div>
  );
}
 
type Props = {
  courts: Court[];
};
 
export default function CourtSlider({ courts }: Props) {
  if (!courts || courts.length === 0) {
    return <p>No courts available</p>;
  }
 
  return (
    <div className="overflow-x-auto py-6">
      <div className="flex gap-4 min-w-max">
        {courts.map((court) => (
          <CourtCard
            key={court.slug}
            court={{
              name: court.name,
              sport: court.sport,
              pricePerHour: court.priceSlots[0]?.price ?? 0,
              openTime: court.openTime,
              closeTime: court.closeTime,
              slug: court.slug,
            }}
            venueName={court.venueName}
            venueSlug={court.slug}
            status="AVAILABLE"
            rating={court.averageRating}
            imageUrl={court.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}