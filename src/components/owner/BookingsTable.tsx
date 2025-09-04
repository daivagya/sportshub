"use client";

import { useMemo } from "react";

interface Booking {
  id: string;
  user: string;
  venue: string;
  sport: string;
  date: string;
  status: "confirmed" | "pending" | "cancelled";
}

const sampleBookings: Booking[] = [
  {
    id: "1",
    user: "Rahul Sharma",
    venue: "City Sports Arena",
    sport: "Football",
    date: "2025-09-02 6:00 PM",
    status: "confirmed",
  },
  {
    id: "2",
    user: "Ananya Verma",
    venue: "Green Turf Ground",
    sport: "Cricket",
    date: "2025-09-05 4:00 PM",
    status: "pending",
  },
  {
    id: "3",
    user: "Arjun Singh",
    venue: "Pool Club",
    sport: "Pool",
    date: "2025-09-07 7:30 PM",
    status: "cancelled",
  },
];

export default function BookingsTable({ filter }: { filter: string }) {
  const filteredBookings = useMemo(() => {
    if (filter === "all") return sampleBookings;
    return sampleBookings.filter((b) => b.status === filter);
  }, [filter]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-600 text-sm">
            <th className="p-3">User</th>
            <th className="p-3">Venue</th>
            <th className="p-3">Sport</th>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-t border-gray-100 hover:bg-gray-50"
            >
              <td className="p-3">{booking.user}</td>
              <td className="p-3">{booking.venue}</td>
              <td className="p-3">{booking.sport}</td>
              <td className="p-3">{booking.date}</td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {booking.status}
                </span>
              </td>
              <td className="p-3 text-right space-x-2">
                {booking.status === "pending" && (
                  <>
                    <button className="px-3 py-1 rounded-md bg-green-500 text-white text-xs hover:bg-green-600">
                      Approve
                    </button>
                    <button className="px-3 py-1 rounded-md bg-red-500 text-white text-xs hover:bg-red-600">
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <button className="px-3 py-1 rounded-md bg-red-500 text-white text-xs hover:bg-red-600">
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filteredBookings.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-400">
                No bookings found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
