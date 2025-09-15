"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import SearchInput from "./SearchInput";
import { getVenueImages } from "@/app/(user)/_userActions/venues.actions";

const DEFAULT_HERO_IMAGES = [
  "/images/hero1.jpg",
  "/images/hero2.jpg",
  "/images/hero3.jpg",
];

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-50 via-white to-green-50">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center py-16 px-4 sm:px-6 md:px-8">
        {/* Left Content */}
        <div className="order-1">
          <HeroHeader />
          <SearchInput />
          <HeroDescription />
        </div>

        {/* Right Content */}
        <HeroCarousel />
      </div>
    </section>
  );
};

export default HeroSection;

const HeroHeader: React.FC = () => (
  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 leading-tight">
    Find Your Game, Your Court.
  </h1>
);

const HeroDescription: React.FC = () => (
  <p className="text-gray-600 text-base md:text-lg mb-8 max-w-lg">
    Seamlessly explore sports venues in your city and play with sports
    enthusiasts just like you!
  </p>
);

const HeroCarousel: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const result = await getVenueImages(10);
        // Fallback to default images if the result is invalid
        if (
          result?.data &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          setImages(result.data);
        } else {
          setImages(DEFAULT_HERO_IMAGES);
        }
      } catch (error) {
        console.error("Failed to load venue images:", error);
        setImages(DEFAULT_HERO_IMAGES);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  return (
    // ✅ STYLE FIX: This parent div maintains its position and order, preventing layout shift.
    <div className="w-full rounded-xl overflow-hidden shadow-2xl aspect-[4/3] order-2">
      {loading ? (
        // The skeleton loader is shown inside the correctly positioned container.
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      ) : (
        // The Swiper carousel is rendered only after loading is complete.
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`Venue image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};
