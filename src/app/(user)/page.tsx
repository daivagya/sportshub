import React, { Suspense } from "react";

import Footer from "@/components/shared/Footer";
import Hero from "@/components/user/client-components/HeroSection";
import VenueSlider from "@/components/user/client-components/VenueSlider";
import CourtSlider from "@/components/user/client-components/CourtsSlider";
import SportsWeOffer from "@/components/user/client-components/SportsWeOffer";
import { getCourts } from "@/app/(user)/_userActions/court.actions";
import { Court } from "@/types/next-auth";

// NEW: A simple loading component to be used with Suspense
function SlidersSkeleton() {
  return (
    <div className="space-y-16">
      {/* Skeleton for Venue Slider */}
      <div>
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-1/3 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
      {/* Skeleton for Court Slider */}
      <div>
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-1/3 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function Page() {
  // Data fetching remains on the server - this is efficient!
  const courts: Court[] = await getCourts(10);

  return (
    // The main container can be a simple fragment or div
    <>
      <Hero />
      {/* ENHANCEMENT: Use a <main> tag for the primary content of the page */}
      <main className="">
        {/* ENHANCEMENT: Wrap data-dependent components in Suspense */}
        <Suspense fallback={<SlidersSkeleton />}>
          {/* ENHANCEMENT: Increased spacing for better visual separation */}
          <div className="space-y-16 container mx-auto px-4 py-16 max-w-6xl">
            <VenueSlider />
            <CourtSlider courts={courts} />
            <SportsWeOffer />
          </div>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default Page;
