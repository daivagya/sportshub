"use client";
import React from "react";
import Link from "next/link";

export default function VenuesManager() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
      <Link href="/manager/venues/add-venue">
        <button className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition absolute top-24 right-10">
          + Add Venue
        </button>
      </Link>
    </div> 
  );
}
  