import { getVenues } from "./_userActions/venues.actions";
import Navbar from "@/components/user/client-components/Navbar";
import VenuesProvider from "../context/VenuesContext";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Data fetching remains on the server, which is efficient.
  const { venues, totalPages, currentPage } = await getVenues({
    page: 1,
    limit: 9,
  });

  // 2. All client-side logic is now delegated to the <Providers> component.
  // We pass the server-fetched data down as props.
  return (
    <VenuesProvider
      initialVenues={venues}
      initialTotalPages={totalPages}
      initialCurrentPage={currentPage}
    >
      <Navbar />
      {children}
    </VenuesProvider>
  );
}
