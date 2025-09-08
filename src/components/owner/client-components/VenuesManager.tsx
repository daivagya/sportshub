"use client";

import { useState } from "react";
import AddVenueForm from "@/components/owner/client-components/AddVenueForm";

export default function VenuesManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
      <button
        onClick={handleOpenForm}
        className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition absolute top-22 right-10"
      >
        + Add Venue
      </button>

      {isFormOpen && <AddVenueForm onClose={handleCloseForm} />}
    </div>
  );
}
