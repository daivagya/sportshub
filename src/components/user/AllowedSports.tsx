"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import SportCard from "./SportCard";
import { sports } from "@/lib/dummyData";

export default function SportsWeOffer() {
  return (
    <section className="">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Sports We Offer
        </h2>
        {/* Optional: Add a "View All" link if a page exists for all sports */}
        {/* <a href="/sports" className="text-green-600 font-medium hover:underline">
          See All
        </a> */}
      </div>

      <Swiper
        modules={[FreeMode, Pagination]}
        spaceBetween={15}
        slidesPerView="auto" // allows the slides to be their natural width
        freeMode={true}
        pagination={{ clickable: true }}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 25,
          },
          1024: {
            slidesPerView: 6,
            spaceBetween: 30,
          },
        }}
        className="mySwiper"
      >
        {sports.map((sport, idx) => (
          <SwiperSlide key={idx} className="!w-[150px]">
            <SportCard image={sport.image} name={sport.name} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}