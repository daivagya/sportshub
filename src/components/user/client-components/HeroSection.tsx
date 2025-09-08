"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const heroImages = [
  "/images/hero1.jpg",
  "/images/hero2.jpg",
  "/images/hero3.jpg",
];

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-green-50 to-white py-12 px-6 md:px-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Text */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Find Players & Venues Nearby
          </h1>
          <p className="text-gray-600 mb-6">
            Seamlessly explore sports venues and play with sports enthusiasts
            just like you!
          </p>

          {/* Search Input */}
          <div className="flex max-w-md">
            <input
              type="text"
              placeholder="Search venues by city or sport"
              className="w-full px-4 py-2 border rounded-l-lg focus:outline-none"
            />
            <button className="bg-green-600 text-white px-6 rounded-r-lg hover:bg-green-700">
              Search
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
          >
            {heroImages.map((src, i) => (
              <SwiperSlide key={i}>
                <img
                  src={src}
                  alt="Hero"
                  className="w-full h-64 md:h-80 object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}