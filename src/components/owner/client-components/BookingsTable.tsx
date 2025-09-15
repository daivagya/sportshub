"use client";

import { useEffect, useState } from "react";
import {
  getManagerBookings,
  confirmManagerBooking,
  cancelManagerBooking,
} from "@/app/(owner)/manager/_actions/booking.actions";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Clock, CheckCheck } from "lucide-react"; // icons
import { ReactNode, ReactElement } from "react";

type Booking = {
  id: number;
  personName: string;
  personEmail: string;
  courtName: string;
  venueName: string;
  sport: string;
  startTime: Date;
  endTime: Date;
  day: string;
  amount: number;
  currency: string;
  status: string;
};

export default function ManagerBookingsTable(bookingsProp: {
  bookings: Booking[];
}) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  >("ALL");
  const [rowLoading, setRowLoading] = useState<number | null>(null);

  // Load bookings
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        await getManagerBookings();
        setBookings(bookingsProp.bookings);
      } catch (err) {
        toast.error("Failed to load bookings. Please try again.");
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    load();
  }, []);

  // Handle confirm
  const handleConfirm = async (id: number) => {
    setRowLoading(id);
    const res = await confirmManagerBooking(id.toString());
    if (res.success) {
      toast.success("Booking confirmed");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CONFIRMED" } : b))
      );
    } else {
      toast.error(res.error!);
    }
    setRowLoading(null);
  };

  // Handle cancel
  const handleCancel = async (id: number) => {
    setRowLoading(id);
    const res = await cancelManagerBooking(id.toString());
    if (res.success) {
      toast.success("Booking cancelled");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } else {
      toast.error(res.error!);
    }
    setRowLoading(null);
  };

  const filteredBookings =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  // Status styles + icons
  const statusStyles: Record<string, { color: string; icon: ReactElement }> = {
    PENDING: {
      color:
        "bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1",
      icon: <Clock size={14} />,
    },
    CONFIRMED: {
      color:
        "bg-green-100 text-green-800 border border-green-300 flex items-center gap-1",
      icon: <CheckCircle size={14} />,
    },
    CANCELLED: {
      color:
        "bg-red-100 text-red-800 border border-red-300 flex items-center gap-1",
      icon: <XCircle size={14} />,
    },
    COMPLETED: {
      color:
        "bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1",
      icon: <CheckCheck size={14} />,
    },
  };

  return (
    <div className="w-full px-4">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-xl font-semibold text-green-700">
          📑 Manager Bookings
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-600"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-green-600 text-white text-left">
                <th className="p-3 border border-gray-300">Person</th>
                <th className="p-3 border border-gray-300">Court</th>
                <th className="p-3 border border-gray-300">Venue</th>
                <th className="p-3 border border-gray-300">Sport</th>
                <th className="p-3 border border-gray-300">Time</th>
                <th className="p-3 border border-gray-300">Amount</th>
                <th className="p-3 border border-gray-300">Status</th>
                <th className="p-3 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b, idx) => (
                <tr
                  key={b.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-green-50`}
                >
                  <td className="p-3 border border-gray-200">
                    <span className="font-medium">
                      {b.personName || "Unknown"}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      {b.personEmail}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-200">{b.courtName}</td>
                  <td className="p-3 border border-gray-200">{b.venueName}</td>
                  <td className="p-3 border border-gray-200">{b.sport}</td>
                  <td className="p-3 border border-gray-200 text-xs text-gray-700">
                    {new Date(b.startTime).toLocaleString()} <br />→{" "}
                    {new Date(b.endTime).toLocaleString()}
                  </td>
                  <td className="p-3 border border-gray-200 font-semibold">
                    {b.amount} {b.currency.toUpperCase()}
                  </td>
                  <td className="p-3 border border-gray-200">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium inline-flex ${
                        statusStyles[b.status]?.color ||
                        "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {statusStyles[b.status]?.icon} {b.status}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-200 space-x-2">
                    {rowLoading === b.id ? (
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-black"></div>
                      </div>
                    ) : (
                      <>
                        {b.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleConfirm(b.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                              disabled={rowLoading !== null}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleCancel(b.id)}
                              className="px-3 py-1 bg-black text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                              disabled={rowLoading !== null}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="px-3 py-1 bg-black text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                            disabled={rowLoading !== null}
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
