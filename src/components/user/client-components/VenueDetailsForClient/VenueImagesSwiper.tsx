"use client"; // This directive is necessary for components using React hooks like useState

import React, { useState } from "react";
import Image from "next/image";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/pagination";

// import required modules
import { FreeMode, Navigation, Thumbs, Pagination } from "swiper/modules";
import type { Swiper as SwiperCore } from "swiper/types";

type VenueImagesProps = {
  images: string[];
};

export default function VenueImagesSwiper({ images }: VenueImagesProps) {
  // State to hold the thumbnail swiper instance
  // We will link this to the main swiper
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);

  // If there are no images, display a single placeholder.
  // This prevents crashes and provides a graceful fallback.
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
        <Image
          src={"/placeholder-image.jpg"} // Ensure you have a placeholder image in your public folder
          alt="Placeholder venue image"
          width={800}
          height={450}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Swiper */}
      <Swiper
        loop={true}
        spaceBetween={10}
        navigation={true}
        pagination={{ clickable: true }} // Use pagination for all screen sizes
        // Link the thumbnail swiper instance here
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[FreeMode, Navigation, Thumbs, Pagination]}
        className="mySwiper2 w-full aspect-video rounded-lg"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index} className="bg-gray-100">
            <div className="flex  justify-center items-center w-full h-full">
              <Image
                src={img}
                alt={`Main venue image ${index + 1}`}
                width={1200}
                height={675}
                className="block w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Swiper - Hidden on mobile/tablet, visible on laptop/desktop */}
      {/* This provides a better UX for larger screens without cluttering smaller ones. */}
      <div className="hidden lg:block">
        <Swiper
          onSwiper={setThumbsSwiper}
          loop={true}
          spaceBetween={10}
          slidesPerView={4} // Show 4 thumbnails at a time
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiperThumbs w-full"
        ></Swiper>
      </div>
    </div>
  );
}
