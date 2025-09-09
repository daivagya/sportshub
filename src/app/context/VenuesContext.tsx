"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Venue } from "@/types/next-auth";  
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getVenues } from "../(user)/_userActions/venues.actions";

// Define the shape of the data that the context will provide.
export type VenuesContextType = {
  venues: Venue[]; // The full, unfiltered list of all venues.
  isLoading: boolean; // A flag to indicate if the initial data fetch is complete.
  filter: string;
};

// Create the context with a default undefined value.
const VenuesContext = createContext<VenuesContextType | undefined>(undefined);

// --- Mock Data Fetching Function ---
// In a real application, this would be an API call to your backend.
async function fetchAllVenues(): Promise<Venue[]> {
  const { venues } = await getVenues({ page: 1, limit: 9 });
  return venues; //  return the array directly
}




// This is the provider component. It is now the default export.
export default function VenuesProvider({ children }: { children: React.ReactNode }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the data only once when the provider is first mounted.
  useEffect(() => {
    const loadVenues = async () => {
      setIsLoading(true);
      const fetchedVenues = await fetchAllVenues();
      setVenues(fetchedVenues);
      setIsLoading(false);
    };
    loadVenues();
  }, []); // Empty dependency array means this runs only once.

  return (
    <VenuesContext.Provider value={{ venues, isLoading }}>
      {children}
    </VenuesContext.Provider>
  );
}

// This is the custom hook that your components will use to access the venue data.
export function useVenues() {
  const context = useContext(VenuesContext);
  if (context === undefined) {
    throw new Error("useVenues must be used within a VenuesProvider");
  }
  return context;
}

