"use client";

import Image from "next/image";
import Link from "next/link";

export default function VenuesTable() {
  // Dummy data simulating venues (replace with DB query later)
  const venues = [
    {
      id: 1,
      name: "Greenfield Turf",
      city: "Mumbai",
      address: "Andheri West, Mumbai",
      rating: 4.5,
      approved: true,
      photos: ["/images/turf.jpg"],
      createdAt: "2025-08-20",
    },
    {
      id: 2,
      name: "Skyline Basketball Court",
      city: "Delhi",
      address: "Dwarka Sector 10, Delhi",
      rating: 4.2,
      approved: false,
      photos: ["/images/basketball.jpg"],
      createdAt: "2025-08-25",
    },
    {
      id: 3,
      name: "Smash Tennis Arena",
      city: "Bangalore",
      address: "Whitefield, Bangalore",
      rating: 4.7,
      approved: true,
      photos: ["/images/tennis.jpg"],
      createdAt: "2025-08-28",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
        <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
          <tr>
            <th className="px-4 py-2">Photo</th>
            <th className="px-4 py-2">Venue</th>
            <th className="px-4 py-2">City</th>
            <th className="px-4 py-2">Address</th>
            <th className="px-4 py-2">Rating</th>
         
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => (
            <tr key={venue.id} className="border-t hover:bg-gray-50">
              {/* Photo */}
              <td className="px-4 py-2">
                {venue.photos.length > 0 ? (
                  <Image
                    src={venue.photos[0]}
                    alt={venue.name}
                    width={60}
                    height={40}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="w-12 h-8 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
                    N/A
                  </div>
                )}
              </td>

              {/* Venue Name */}
              <td className="px-4 py-2 font-medium text-gray-800">
                {venue.name}
              </td>

              {/* City */}
              <td className="px-4 py-2">{venue.city}</td>

              {/* Address */}
              <td className="px-4 py-2 text-gray-600">{venue.address}</td>

              {/* Rating */}
              <td className="px-4 py-2">{venue.rating ?? "-"}</td>

            

              {/* Created Date */}
              <td className="px-4 py-2 text-gray-500">{venue.createdAt}</td>

              {/* Actions → View Courts */}
              <td className="px-4 py-2 text-right">
                <Link
                  href={`/owner/venues/${venue.id}`}
                  className="px-3 py-1 text-xs rounded-md bg-green-500 text-white hover:bg-green-600"
                >
                  View Courts
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
