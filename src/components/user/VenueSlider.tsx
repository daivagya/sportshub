// components/user/VenueSlider.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import VenueCard from "./VenueCard";
import { venues } from "@/lib/dummyData";

export default function VenueSlider() {
  return (
    <section className="py-10">
      <div className="">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Venues</h2>
          <a href="/venues"className="text-sm font-semibold text-green-600 px-5 py-2 bg-green-50 border border-green-600 rounded hover:bg-green-600 hover:text-white">
            See all
          </a>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1.1} // a little "peek" of next card on mobile
          pagination={{ clickable: true }}
          grabCursor={true}
          breakpoints={{
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {venues.map((venue) => (
            <SwiperSlide key={venue.id}>
              <VenueCard venue={venue} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
