"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookingsTable from "@/components/owner/BookingsTable";

export default function ManagerBookingsPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
        Bookings
      </h1>
      <p className="text-gray-500 mb-6">Manage and review venue bookings</p>

      {/* Filter Controls */}
      <div className="flex items-center gap-3 mb-6">
        {["all", "confirmed", "pending", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === status
                ? "bg-green-100 text-green-700"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-gray-800">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingsTable filter={filter} />
        </CardContent>
      </Card>
    </div>
  );
}
