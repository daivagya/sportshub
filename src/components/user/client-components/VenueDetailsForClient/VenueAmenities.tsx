"use client"; // Add if you use client-side icons that require it

import { ParkingCircle, ShowerHead, Wifi, Plug, Lock } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';

// Assume you get a list of amenities from your API, e.g., ['parking', 'wifi']
type VenueAmenitiesProps = {
  amenities: string[];
};

const iconMap: { [key: string]: { icon: React.FC<LucideProps>; label: string } } = {
  parking: { icon: ParkingCircle, label: 'Free Parking' },
  showers: { icon: ShowerHead, label: 'Showers' },
  wifi: { icon: Wifi, label: 'Free Wi-Fi' },
  charging: { icon: Plug, label: 'Charging Stations' },
  lockers: { icon: Lock, label: 'Lockers' },
};

export default function VenueAmenities({ amenities }: VenueAmenitiesProps) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Amenities & Facilities</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {amenities.map((amenityKey) => {
          const amenity = iconMap[amenityKey];
          if (!amenity) return null;
          
          const IconComponent = amenity.icon;
          return (
            <div key={amenityKey} className="flex items-center p-4 bg-gray-50 rounded-lg border">
              <IconComponent className="w-6 h-6 text-indigo-600 mr-4" />
              <span className="font-medium text-gray-700">{amenity.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}