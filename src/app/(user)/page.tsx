import React from "react";

import Footer from "@/components/user/Footer";
import Hero from "@/components/user/HeroSection";
import VenueSlider from "@/components/user/VenueSlider";
import TopRatedCourts from "@/components/user/CourtsSlider";
import SportsWeOffer from "@/components/user/AllowedSports";

function page() {
  return (
    <div className="min-h-screen relative">
      <Hero />
      <div className="container mx-auto px-4 space-y-2.5">
        <VenueSlider />
        <TopRatedCourts />
        <SportsWeOffer />
      </div>
      <Footer />
    </div>
  );
}

export default page;
