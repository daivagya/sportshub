
"use client";
 
import React from "react";
import { type GameType } from "@/constants/games";
 
interface Sport {
  name: GameType;
  image: string; // image path
}
 
// Example: replace these with your actual images
const SPORTS_TO_DISPLAY: Sport[] = [
  { name: "Badminton", image: "/images/sports/badminton.png" },
  { name: "Tennis", image: "/images/sports/tennis.png" },
  { name: "Basketball", image: "/images/sports/basketball.png" },
  { name: "Football", image: "/images/sports/football.png" },
  { name: "Cricket", image: "/images/sports/cricket.png" },
  { name: "Volleyball", image: "/images/sports/volleyball.png" },
  { name: "Table Tennis", image: "/images/sports/table-tennis.png" },
  { name: "Squash", image: "/images/sports/squash.png" },
];
 
interface SportCardProps {
  sport: Sport;
}
 
function SportCard({ sport }: SportCardProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 w-28 h-28 cursor-pointer group">
      <img
        src={sport.image}
        alt={sport.name}
        className="w-12 h-12 mb-2 object-contain transition-transform duration-300 group-hover:scale-110"
      />
      <span className="text-sm font-medium text-gray-800 dark:text-gray-100 text-center">
        {sport.name}
      </span>
    </div>
  );
}
 
export default function SportsWeOffer() {
  return (
    <section className="py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sports We Offer
        </h2>
      </div>
 
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
        {SPORTS_TO_DISPLAY.map((sport) => (
          <SportCard key={sport.name} sport={sport} />
        ))}
      </div>
    </section>
  );
}
