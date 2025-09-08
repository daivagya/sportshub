// src/app/(owner)/manager/venues/page.tsx
import VenuesManager from "@/components/owner/client-components/VenuesManager";
import OwnedVenuesContent from "@/components/owner/server-components/OwnedVenuesContent";
export const dynamic = "force-dynamic"
export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Venues</h1>

      {/* Client component manages form open/close */}
      <VenuesManager />

      {/* Server component fetches and displays venues */}
      <OwnedVenuesContent />
    </div>
  );
}
