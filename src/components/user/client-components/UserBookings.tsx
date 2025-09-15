"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ReactElement } from "react";
import { UserBooking } from "@/types/bookings";
import {
  Calendar,
  MapPin,
  Trophy,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cancelUserBooking } from "@/app/(user)/_userActions/booking.actions";

export default function UserBookings({
  bookings,
}: {
  bookings: UserBooking[];
}) {
  const [localBookings, setLocalBookings] = useState(bookings);
  const [rowLoading, setRowLoading] = useState<number | null>(null);

  const handleCancel = async (id: number) => {
    setRowLoading(id);
    const res = await cancelUserBooking(id);
    if (res.success) {
      toast.success("Booking cancelled");
      setLocalBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } else {
      toast.error(res.error!);
    }
    setRowLoading(null);
  };

  const statusConfig: Record<
    string,
    { color: string; label: string; icon: ReactElement }
  > = {
    PENDING: {
      color:
        "bg-yellow-50 text-yellow-700 border border-yellow-300 shadow-sm shadow-yellow-100",
      label: "Pending",
      icon: <Clock size={16} />,
    },
    CONFIRMED: {
      color:
        "bg-green-50 text-green-700 border border-green-300 shadow-sm shadow-green-100",
      label: "Confirmed",
      icon: <CheckCircle2 size={16} />,
    },
    CANCELLED: {
      color:
        "bg-red-50 text-red-700 border border-red-300 shadow-sm shadow-red-100",
      label: "Cancelled",
      icon: <XCircle size={16} />,
    },
    COMPLETED: {
      color:
        "bg-blue-50 text-blue-700 border border-blue-300 shadow-sm shadow-blue-100",
      label: "Completed",
      icon: <CheckCircle2 size={16} />,
    },
  };

  if (localBookings.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 text-center py-20">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <p className="text-gray-500 mt-4 text-lg font-medium">
          No bookings yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {localBookings.map((b) => (
        <div
          key={b.id}
          className="rounded-2xl bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 p-6 flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-green-800">
              {b.court?.name || "Court"}
            </h3>
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                statusConfig[b.status]?.color
              }`}
            >
              {statusConfig[b.status]?.icon}
              {statusConfig[b.status]?.label || b.status}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm text-gray-700 mb-5">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-green-600" />
              <span className="font-medium">
                {b.venue?.name || "Unknown Venue"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-green-600" />
              <span>{b.sport}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-green-600" />
              <span>
                {new Date(b.startTime).toLocaleString()} →{" "}
                {new Date(b.endTime).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="font-semibold text-gray-900">
                {b.amount} {b.currency.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {rowLoading === b.id ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-600 mx-auto"></div>
            ) : (
              <>
                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="flex-1 px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-900 active:scale-95 transition transform shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                )}
                <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-95 transition transform shadow-sm hover:shadow-md">
                  View Details
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
