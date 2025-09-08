"use client";

import { useMemo } from "react";
import dayjs from "dayjs";

interface Booking {
  id: number;
  user: { name: string; email: string };
  court: { name: string; venue?: string };
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  payment?: { id: number; status: string } | null;
  createdAt: string;
}

// ✅ Sample dummy data (replace with Prisma query result)
const sampleBookings: Booking[] = [
  {
    id: 1,
    user: { name: "Rahul Sharma", email: "rahul@example.com" },
    court: { name: "Football Court", venue: "City Sports Arena" },
    startTime: "2025-09-05T16:00:00Z",
    endTime: "2025-09-05T18:00:00Z",
    status: "CONFIRMED",
    payment: { id: 101, status: "SUCCESS" },
    createdAt: "2025-09-01T12:30:00Z",
  },
  {
    id: 2,
    user: { name: "Ananya Verma", email: "ananya@example.com" },
    court: { name: "Cricket Pitch", venue: "Green Turf Ground" },
    startTime: "2025-09-07T07:00:00Z",
    endTime: "2025-09-07T09:00:00Z",
    status: "PENDING",
    payment: null,
    createdAt: "2025-09-02T09:15:00Z",
  },
  {
    id: 3,
    user: { name: "Arjun Singh", email: "arjun@example.com" },
    court: { name: "Basketball Court", venue: "Skyline Sports Complex" },
    startTime: "2025-09-08T18:00:00Z",
    endTime: "2025-09-08T20:00:00Z",
    status: "CANCELLED",
    payment: null,
    createdAt: "2025-09-03T14:20:00Z",
  },
  {
    id: 4,
    user: { name: "Meera Iyer", email: "meera@example.com" },
    court: { name: "Tennis Court", venue: "Smash Tennis Arena" },
    startTime: "2025-09-10T06:30:00Z",
    endTime: "2025-09-10T08:00:00Z",
    status: "CONFIRMED",
    payment: { id: 102, status: "SUCCESS" },
    createdAt: "2025-09-04T10:45:00Z",
  },
];

export default function BookingsTable({ filter }: { filter?: string }) {
  const filteredBookings = useMemo(() => {
    if (!filter || filter === "all") return sampleBookings;
    return sampleBookings.filter((b) => b.status === filter.toUpperCase());
  }, [filter]);

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Court</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">End</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((b) => (
            <tr
              key={b.id}
              className="border-t hover:bg-gray-50 transition-colors"
            >
              {/* User */}
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">{b.user.name}</div>
                <div className="text-xs text-gray-500">{b.user.email}</div>
              </td>

              {/* Court */}
              <td className="px-4 py-3">
                <div className="font-medium">{b.court.name}</div>
                {b.court.venue && (
                  <div className="text-xs text-gray-500">{b.court.venue}</div>
                )}
              </td>

              {/* Start Time */}
              <td className="px-4 py-3">
                {dayjs(b.startTime).format("DD MMM, hh:mm A")}
              </td>

              {/* End Time */}
              <td className="px-4 py-3">
                {dayjs(b.endTime).format("DD MMM, hh:mm A")}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    b.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : b.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {b.status}
                </span>
              </td>

              {/* Payment */}
              <td className="px-4 py-3">
                {b.payment ? (
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                    Paid
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-500">
                    Pending
                  </span>
                )}
              </td>

              {/* Created Date */}
              <td className="px-4 py-3 text-gray-500">
                {dayjs(b.createdAt).format("DD MMM YYYY")}
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right space-x-2">
                {b.status === "PENDING" && (
                  <>
                    <button className="px-3 py-1 text-xs rounded-md bg-green-500 text-white hover:bg-green-600">
                      Approve
                    </button>
                    <button className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600">
                      Cancel
                    </button>
                  </>
                )}
                {b.status === "CONFIRMED" && (
                  <button className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600">
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}

          {filteredBookings.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="text-center py-6 text-gray-400 text-sm"
              >
                No bookings found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
