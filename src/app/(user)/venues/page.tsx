// src/app/venues/page.tsx
"use client"
import FilterSidebar, { VenueFilters } from "@/components/user/FilterSidebar";
import { venues as dummyVenues } from "@/lib/dummyData"; // Assuming you have dummy data to pass as props

export default function VenuesPage() {
  // A placeholder function to pass to the sidebar component
  // const handleFilterChange = (filters: VenueFilters) => {
  //   console.log("Filters updated in parent:", filters);
  //   // You would typically set state and filter your venue list here
  // };

  return (
    // 1. Main container with a flex layout and a gap between children
    <div className="flex gap-8 p-8 bg-gray-50 min-h-screen">
      
      {/* 2. Your FilterSidebar component */}
      <FilterSidebar venues={dummyVenues}  />

      {/* 3. The main content area that will take up the remaining space */}
      <main className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Venues</h1>
        <div className="p-10 bg-white rounded-2xl shadow-lg">
          {/* Your venue cards or other content will go here */}
          <p className="text-gray-600">Your list of venues will be displayed here.</p>
        </div>
      </main>

    </div>
  );
}