import { Star } from "lucide-react";

// NOTE: You'll fetch this data from your database
const dummyReviews = [
  { id: 1, user: "Alex Johnson", rating: 5, comment: "Fantastic courts and great facilities. Highly recommended!", date: "2025-08-22" },
  { id: 2, user: "Maria Garcia", rating: 4, comment: "Good place, but can get a bit crowded on weekends. Book in advance.", date: "2025-08-15" },
];

export default function VenueReviews() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">What People Are Saying</h2>
      <div className="space-y-6">
        {dummyReviews.map(review => (
          <div key={review.id} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{review.user}</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600">"{review.comment}"</p>
            <p className="text-right text-xs text-gray-400 mt-2">{new Date(review.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}