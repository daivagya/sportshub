// FIX: Corrected the directive from "use-client" to "use client"
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import VenueCard from "@/components/shared/VenueCard"; // Assuming this path is correct
import { useVenues } from "@/app/context/VenuesContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

// A skeleton component for a better loading experience
function VenueCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-xl shadow-md bg-white dark:bg-gray-800 animate-pulse">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
      <div className="p-4">
        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

export default function VenueSlider() {
  const { venues, isLoading } = useVenues();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // State to manage the visibility/disabled state of scroll buttons
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Callback to check scroll position
  const checkScrollPosition = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      const atStart = el.scrollLeft === 0;
      // Use a small buffer (5px) to account for sub-pixel rendering issues
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
      setIsAtStart(atStart);
      setIsAtEnd(atEnd);
    }
  }, []);

  // Check scroll position on load, on scroll, and on resize
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      checkScrollPosition();
      el.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        el.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [venues, isLoading, checkScrollPosition]);

  const scroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8; // Scroll by 80% of the visible width
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Featured Venues
          </h2>
          <a
            href="/venues"
            className="text-sm font-semibold text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            See all
          </a>
        </div>

        <div className="relative group/slider">
          {/* Slider Container */}
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          >
            {isLoading
              ? // Render skeletons while loading
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="snap-start flex-shrink-0 w-[85%] sm:w-[45%] md:w-[31%] lg:w-[23.5%]"
                  >
                    <VenueCardSkeleton />
                  </div>
                ))
              : venues.map((venue: any) => (
                  <div
                    key={venue.slug}
                    className="snap-start flex-shrink-0 w-[85%] sm:w-[45%] md:w-[31%] lg:w-[23.5%]"
                  >
                    <div className="h-full">
                      <VenueCard venue={venue} />
                    </div>
                  </div>
                ))}
          </div>

          {/* Smarter Navigation Buttons */}
          {!isLoading && venues.length > 4 && (
            <>
              <button
                onClick={() => scroll("left")}
                disabled={isAtStart}
                className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-full p-2 transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-0"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={isAtEnd}
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-full p-2 transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-0"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}