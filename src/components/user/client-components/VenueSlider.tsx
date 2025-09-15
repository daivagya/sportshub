"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import VenueCard from "@/components/shared/VenueCard";
import { useVenues } from "@/app/context/VenuesContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

function VenueCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-xl shadow-md bg-white dark:bg-gray-800 animate-pulse">
      <div className="w-full aspect-[4/3] bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
      <div className="p-4 flex flex-col flex-1">
        <div className="h-7 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        <div className="mt-auto h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

export default function VenueSlider() {
  const { venues, isLoading } = useVenues();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setCanScroll(hasOverflow);
      setIsAtStart(el.scrollLeft <= 0);
      setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el && !isLoading) {
      checkScrollPosition();
      el.addEventListener("scroll", checkScrollPosition, { passive: true });
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
      const scrollAmount = el.clientWidth * 0.9;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const skeletonCount = 4;
  const gridColumnClasses =
    "grid-flow-col auto-cols-[90%] sm:auto-cols-[60%] md:auto-cols-[47%] lg:auto-cols-[31.5%]";

  return (
    <section className="py-8">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Featured Venues
          </h2>
          <a
            href="/venues"
            className="text-sm font-semibold text-green-600 border border-green-500 bg-green-100 px-4 py-2 rounded-lg hover:bg-green-200 dark:bg-transparent dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/40 transition-colors"
          >
            See all
          </a>
        </div>

        <div className="relative">
          <div
            ref={containerRef}
            className={`grid ${gridColumnClasses} gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide`}
          >
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, index) => (
                  <div key={index} className="snap-center">
                    <VenueCardSkeleton />
                  </div>
                ))
              : venues.map((venue: any) => (
                  <div key={venue.slug} className="snap-center">
                    <VenueCard venue={venue} />
                  </div>
                ))}
          </div>

          {canScroll && (
            <>
              <button
                onClick={() => scroll("left")}
                disabled={isAtStart}
                className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg rounded-full p-2 transition-opacity disabled:opacity-0 hover:bg-white dark:hover:bg-gray-800"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={isAtEnd}
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg rounded-full p-2 transition-opacity disabled:opacity-0 hover:bg-white dark:hover:bg-gray-800"
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
