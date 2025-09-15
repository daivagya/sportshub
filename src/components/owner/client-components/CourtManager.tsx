"use client";

import { useState, useEffect } from "react";
import { Court } from "@/types/next-auth";
import { AddCourtForm } from "@/components/owner/client-components/AddCourtForm";
import CourtCard from "@/components/shared/CourtCard";
interface CourtManagerProps {
  venueSlug: string;
  venueName: string;
  venueId?: number;
  initialCourts: Court[];
}

export default function CourtManager({
  venueSlug,
  venueName,
  initialCourts,
}: CourtManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [courts, setCourts] = useState<Court[]>(initialCourts);

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  useEffect(() => {
    setCourts(initialCourts);
  }, [initialCourts]);
  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Manage Courts for {venueName || venueSlug}
        </h1>
        <button
          onClick={handleOpenForm}
          className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Court
        </button>
      </div>

      {isFormOpen && (
        <AddCourtForm venueSlug={venueSlug} onClose={handleCloseForm} />
      )}

      {courts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              venueName={venueName}
              venueSlug={venueSlug}
              status="AVAILABLE"
              averageRating={4.5}
              imageUrl={
                court?.imageUrl ||
                `https://placehold.co/600x400/000000/FFFFFF?text=${court.name.replace(
                  " ",
                  "+"
                )}`
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No courts found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding your first court.
          </p>
        </div>
      )}
    </div>
  );
}
