"use client";
import React from "react";
import VenuesTable from "@/components/owner/VenuesTable";
import AddVenueForm from "@/components/owner/AddVenueForm";
import { useState } from "react";
function Page() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 2. The onClose handler function
  // This function will be passed as a prop to your form.
  // Its only job is to update the state and hide the form.
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Function to open the form
  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Venues</h1>
        <button
          onClick={() => handleOpenForm()}
          className="mt-3 sm:mt-0 bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          + Add Venue
        </button>
      </div>

      {/* Add Venue Form */}
      {isFormOpen && <AddVenueForm onClose={handleCloseForm} />}

      {/* Card Wrapper */}
      <div className="bg-white shadow rounded-lg p-4">
        <VenuesTable />
      </div>
    </div>
  );
}

export default Page;
