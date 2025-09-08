// Your CourtsSection file
import { getCourtsByVenueSlug } from "@/app/(owner)/manager/_actions/court.actions";
import CourtManager from "../client-components/CourtManager";
import { Court } from "@/types/next-auth";

interface CourtsSectionProps {
  venueSlug: string;
}

// FIX: Receive props as an object { venueSlug }
export default async function CourtsSection({ venueSlug }: CourtsSectionProps) {
  const { venue, courts } = await getCourtsByVenueSlug(venueSlug);
  console.log("------------------courts>>", courts);
  return (
    <CourtManager
      venueSlug={venueSlug}
      venueName={courts[0].venueName}
      venueId={venue?.id}
      initialCourts={courts}
    />
  );
}
