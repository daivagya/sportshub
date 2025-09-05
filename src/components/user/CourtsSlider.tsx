"use client";
import { Star } from "lucide-react";
import { courts, venues, bookings } from "@/lib/dummyData";
import CourtCard from "./CourtCard";
export default function TopRatedCourts() {
  const topCourts = courts.slice(0, 4); // pick top 4 for now

  const getVenueName = (venueId: number) =>
    venues.find((v) => v.id === venueId)?.name ?? "Unknown Venue";

  const getBookingStatus = (courtId: number) => {
    const booking = bookings.find((b) => b.courtId === courtId);
    return booking ? booking.status : "AVAILABLE";
  };

  return (
    <section className="w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-black mb-6">
          Top Rated Courts
        </h2>
        <a href="#" className="text-sm font-semibold text-green-600 px-5 py-2 bg-green-50 border border-green-600 rounded hover:bg-green-600 hover:text-white">
          See all
        </a>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {topCourts.map((court) => {
          const venue = getVenueName(court.venueId);
          const status = getBookingStatus(court.id);
          return (
            <CourtCard
              key={court.id}
              court={court}
              venue={venue}
              // status={status}
            />
          );
        })}
      </div>
    </section>
  );
}
