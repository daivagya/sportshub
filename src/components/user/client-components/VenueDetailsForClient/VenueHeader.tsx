"use client"
import { MapPin, Star } from "lucide-react"; // Assuming you use lucide-react for icons

type VenueHeaderProps = {
  name: string;
  address: string;
  city: string;
  state: string;
  rating: number; // e.g., 4.5
};

export default function VenueHeader({ name, address, city, state, rating }: VenueHeaderProps) {
  return (
    <div className="pb-6 border-b">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">{name}</h1>
      <div className="mt-4 flex items-center space-x-6 text-gray-600">
        <div className="flex items-center">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <span className="ml-1 font-semibold">{rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="w-5 h-5" />
          <span className="ml-1">{`${address}, ${city}, ${state}`}</span>
        </div>
      </div>
    </div>
  );
}