import Image from "next/image";
import Link from "next/link";

// NOTE: This data would come from a database query based on location
const dummyNearbyVenues = [
  { id: "1", slug: "downtown-sports-club", name: "Downtown Sports Club", image: "/placeholder-venue-1.jpg", distance: "2.5 km away" },
  { id: "2", slug: "riverside-arena", name: "Riverside Arena", image: "/placeholder-venue-2.jpg", distance: "4.1 km away" },
  { id: "3", slug: "summit-recreation", name: "Summit Recreation", image: "/placeholder-venue-3.jpg", distance: "5.8 km away" },
];


export default function NearbyVenues() {
  return (
    <div className="bg-gray-50 -mx-4 px-4 py-10 sm:mx-0 sm:rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">More Venues Nearby</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyNearbyVenues.map(venue => (
          <Link href={`/venues/${venue.slug}`} key={venue.id}>
            <div className="group rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video w-full overflow-hidden">
                <Image
                  src={venue.image}
                  alt={venue.name}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{venue.name}</h3>
                <p className="text-sm text-gray-500">{venue.distance}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}