// src/app/venues/page.tsx  (server)
import { Suspense } from "react";
import VenuesContent from "@/components/user/client-components/VenuesClientParent";

export default function VenuesPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading venues...</p>}>
      <VenuesContent />
    </Suspense>
  );
}
