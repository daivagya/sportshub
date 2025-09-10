"use client";

import { useTransition } from "react";
import VenueCard from "@/components/shared/VenueCard";
import { Venue } from "@/types/next-auth";
import Button from "@/components/shared/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VenueListProps {
  venues: Venue[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  clientSlug?: string; // parent callback for pagination
}

export default function VenueList({
  venues,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
  clientSlug
}: VenueListProps) {
  const [isPending] = useTransition();

  const showLoading = isLoading || isPending;

  return (
    <div className="w-full">
      {/* --- Heading --- */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">Venues</h2>
      </div>

      {/* --- Loading Skeleton --- */}
      {showLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 bg-gray-200 rounded-2xl animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : venues.length === 0 ? (
        /* --- Empty State --- */
        <div className="flex flex-col items-center justify-center text-gray-500 py-16">
          <div className="w-24 h-24 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2h6v2m-7 4h8a2 2 0 002-2v-6a2 2 0 00-2-2h-1V7a3 3 0 10-6 0v4H9a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">No venues match your filters.</p>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or resetting them.
          </p>
        </div>
      ) : (
        <>
          {/* --- Venue Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <VenueCard key={venue.slug} venue={venue} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange?.(currentPage - 1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <span className="text-gray-600">
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange?.(currentPage + 1)}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
