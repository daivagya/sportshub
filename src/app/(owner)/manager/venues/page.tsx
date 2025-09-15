// src/app/(owner)/manager/venues/page.tsx
import VenuesManager from "@/components/owner/client-components/VenuesManager";
import OwnedVenuesContent from "@/components/owner/server-components/OwnedVenuesContent";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <div className="min-h-screen container max-w-[1320px] mx-auto p-6">
      <h1 className="text-3xl ml-6 mt-1 font-bold text-gray-800">
        Manage Venues
      </h1>

      {/* Client component manages form open/close */}
      <VenuesManager />

      {/* Server component fetches and displays venues */}
      <OwnedVenuesContent />
    </div>
  );
}
