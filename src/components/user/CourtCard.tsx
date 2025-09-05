"use client";

import React from "react";
import { Star } from "lucide-react";

// The props type definition remains the same
type CourtCardProps = {
  court: {
    name: string;
  };
  venue: string;
  status: "CONFIRMED" | "PENDING" | "AVAILABLE";
  rating: number;
  imageUrl: string;
};

export default function CourtCard({ court, venue, status, rating, imageUrl }: CourtCardProps) {
  return (
    // 👇 THE MAGIC HAPPENS HERE!
    // 1. `rounded-2xl`: Sets a base radius for all corners.
    // 2. `rounded-tr-[60px]`: Overrides the top-right corner with a large, sweeping radius.
    // 3. `rounded-bl-[60px]`: Does the same for the bottom-left, creating the diagonal effect.
    // 4. `overflow-hidden`: This is crucial as it forces the image to conform to this new shape.
    <div className="relative overflow-hidden rounded-2xl rounded-tr-[60px] rounded-bl-[60px] shadow-lg group">
      <img
        src={imageUrl}
        alt={court.name}
        className="object-cover w-full h-52 transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center text-sm font-semibold text-yellow-400">
            <Star className="w-4 h-4 mr-1" /> {rating}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded ${
              status === "CONFIRMED"
                ? "bg-red-500 text-white"
                : status === "PENDING"
                ? "bg-yellow-500 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {status}
          </span>
        </div>
        <h3 className="font-semibold text-white">{court.name}</h3>
        <p className="text-xs text-white/80">{venue}</p>
      </div>
    </div>
  );
}