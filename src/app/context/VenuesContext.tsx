"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Venue } from "@/types/next-auth";
import { getVenues } from "../(user)/_userActions/venues.actions";

// --- Context Type ---
export type VenuesContextType = {
  venues: Venue[];            // Current list of venues (filtered or full)
  totalPages: number;         // Total pages for pagination
  currentPage: number;        // Current page number
  isLoading: boolean;         // Loading state
  refreshVenues: (page?: number, limit?: number) => Promise<void>; // Refresh data
};

// --- Props for Provider ---
type VenuesProviderProps = {
  children: React.ReactNode;
  initialVenues: Venue[];
  initialTotalPages: number;
  initialCurrentPage: number;
};

// --- Create Context ---
const VenuesContext = createContext<VenuesContextType | undefined>(undefined);

// --- Provider Component ---
export default function VenuesProvider({
  children,
  initialVenues,
  initialTotalPages,
  initialCurrentPage,
}: VenuesProviderProps) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to refresh venues (can be called after clearing filters, changing page, etc.)
  const refreshVenues = useCallback(
    async (page: number = 1, limit: number = 9) => {
      try {
        setIsLoading(true);
        const { venues: fetchedVenues, totalPages, currentPage } = await getVenues({ page, limit });
        setVenues(fetchedVenues);
        setTotalPages(totalPages);
        setCurrentPage(currentPage);
      } catch (err) {
        console.error("Failed to refresh venues:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <VenuesContext.Provider
      value={{
        venues,
        totalPages,
        currentPage,
        isLoading,
        refreshVenues,
      }}
    >
      {children}
    </VenuesContext.Provider>
  );
}

// --- Custom Hook to Use Context ---
export function useVenues() {
  const context = useContext(VenuesContext);
  if (!context) {
    throw new Error("useVenues must be used within a VenuesProvider");
  }
  return context;
}
