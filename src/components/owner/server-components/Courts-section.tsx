// Your CourtsSection file
import { getCourtsByVenueSlug } from "@/app/(owner)/manager/_actions/court.actions";
import CourtManager from "../client-components/CourtManager";
import { Court } from "@/types/next-auth";
import toast from "react-hot-toast";

interface CourtsSectionProps {
  venueSlug: string;
}

// FIX: Receive props as an object { venueSlug }
export default async function CourtsSection({ venueSlug }: CourtsSectionProps) {
  const { venue, courts } = await getCourtsByVenueSlug(venueSlug);
  if(!venue) toast.error("Venue not found. Please try again.");
  console.log("------------------courtsSection.tsx>>", courts);
  return (
    <CourtManager
      venueSlug={venueSlug}
      venueName={venue!.name}
      venueId={venue?.id}
      initialCourts={courts}
    />
  );
}
