import { getManagerBookings } from "../_actions/booking.actions";
import BookingsTable from "@/components/owner/client-components/BookingsTable";

export const revalidate = 60; // ⏳ cache for 1 min (tweak as needed)

export default async function BookingsPage() {
  const bookings = await getManagerBookings();

  return (
    <div className="p-8">
      <BookingsTable bookings={bookings} />
    </div>
  );
}
