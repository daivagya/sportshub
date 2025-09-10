import type { Court } from "@/types/next-auth"; // Assuming Court type is in your types file
import Image from "next/image";
import { DollarSign, Zap } from "lucide-react";

type VenueCourtsProps = {
  courts: Court[];
};

export default function VenueCourts({ courts }: VenueCourtsProps) {
  if (!courts || courts.length === 0) {
    return null; // Don't render the section if there are no courts
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Courts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <div key={court.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
            {/* <div className="aspect-video w-full bg-gray-100">
               <Image
                 src={court.image || "/placeholder-court.jpg"}
                 alt={court.name}
                 width={400}
                 height={225}
                 className="w-full h-full object-cover"
               />
            </div> */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900">{court.name}</h3>
              <p className="text-sm text-indigo-600 font-medium mb-2">{court.sport}</p>
              <div className="flex items-center text-gray-600 text-sm mb-4">
                <DollarSign className="w-4 h-4 mr-1" />
                {/* <span>{court.price} per hour</span> */}
              </div>
              <button className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2" />
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}