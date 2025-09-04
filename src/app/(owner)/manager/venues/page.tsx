"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import VenuesTable from "@/components/owner/VenuesTable";
import AddVenueForm from "@/components/owner/AddVenueForm";

export default function VenuesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
        My Venues
      </h1>
      <p className="text-gray-500 mb-6">
        Manage and add venues you own and offer for booking
      </p>

      {/* Add Venue Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>+ Add Venue</Button>
      </div>

      {/* Venues Table */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-gray-800">Owned Venues</CardTitle>
        </CardHeader>
        <CardContent>
          <VenuesTable />
        </CardContent>
      </Card>

      {/* Modal for Add Venue Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            {/* Modal Header */}
            <h2 className="text-xl font-bold mb-4">Add New Venue</h2>

            {/* Venue Form */}
            <AddVenueForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
