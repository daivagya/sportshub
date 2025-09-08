"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { Venue } from "@/types/next-auth";

export type VenuesContextType = {
  venues: Venue[];
  currentPage: number;
  totalPages: number;
  currentVenues: Venue[];
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
};

const VenuesContext = createContext<VenuesContextType | undefined>(undefined);

export function VenuesProvider({
  children,
  initialVenues = [],
}: {
  children: React.ReactNode;
  initialVenues?: Venue[];
}) {
  // ✅ Store full dataset in state
  const [venues] = useState<Venue[]>(initialVenues);
  const [currentPage, setCurrentPage] = useState(1);
  const venuesPerPage = 6;

  const totalPages = Math.max(1, Math.ceil(venues.length / venuesPerPage));
  const startIndex = (currentPage - 1) * venuesPerPage;

  const currentVenues = useMemo(
    () => venues.slice(startIndex, startIndex + venuesPerPage),
    [venues, startIndex]
  );

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToPage = (page: number) =>
    setCurrentPage((_) =>
      page >= 1 && page <= totalPages ? page : currentPage
    );

  return (
    <VenuesContext.Provider
      value={{
        venues,
        currentPage,
        totalPages,
        currentVenues,
        nextPage,
        prevPage,
        goToPage,
      }}
    >
      {children}
    </VenuesContext.Provider>
  );
}

export function useVenues() {
  const ctx = useContext(VenuesContext);
  if (!ctx) throw new Error("useVenues must be used within a VenuesProvider");
  return ctx;
}
