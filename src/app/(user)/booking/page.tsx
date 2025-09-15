import { getUserBookings } from "../_userActions/booking.actions";
import UserBookings from "@/components/user/client-components/UserBookings";

export default async function BookingPage() {
  const bookings = await getUserBookings();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-green-700 mb-6">📅My Bookings</h1>
      <UserBookings bookings={bookings} />
    </div>
  );
}
