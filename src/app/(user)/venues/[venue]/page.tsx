"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import FilterSidebar from "@/components/user/client-components/FilterSidebar";
import VenueList from "@/components/user/client-components/VenueList";
export const revalidate = 10;
export default function VenueSearchSystem() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for your venues and loading status
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // When a filter changes, this function updates the URL
  const handleFilterChange = (filterName, value) => {
    const currentParams = new URLSearchParams(searchParams);
    if (value) {
      currentParams.set(filterName, value);
    } else {
      currentParams.delete(filterName); // Clear the filter if value is empty
    }
    // This updates the URL without reloading the page
    router.push(`${pathname}?${currentParams.toString()}`);
  };

  // This effect runs whenever the URL (searchParams) changes
  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      // The searchParams object is directly used to call your API
      const response = await fetch(`/api/venues?${searchParams.toString()}`);
      const data = await response.json();
      setVenues(data.venues);
      // You'd also get pagination info from the API
      // setTotalPages(data.totalPages);
      setIsLoading(false);
    };

    fetchVenues();
  }, [searchParams]); // The dependency array is key!

  return (
    <div className="flex">
      <FilterSidebar
        currentParams={searchParams}
        onFilterChange={handleFilterChange}
      />
      <VenueList venues={venues} isLoading={isLoading} />
    </div>
  );
}
