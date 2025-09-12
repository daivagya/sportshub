"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useGeoapifyAutocomplete, Suggestion } from "@/lib/geoApifyAutoComplete"; // This import now works correctly
import { useRouter } from "next/navigation";
import { Search, LoaderCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getVenueImages } from "@/app/(user)/_userActions/venues.actions";

const defaultHeroImages = ["/images/hero1.jpg", "/images/hero2.jpg", "/images/hero3.jpg"];

export default function HeroSection() {
  const router = useRouter();
  const { inputValue, setInputValue, suggestions, loading, setSuggestions } = useGeoapifyAutocomplete();
  const [images, setImages] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setImagesLoading(true);
      const result = await getVenueImages(10);
      if (result.success && result.data && result.data.length > 0) {
        setImages(result.data);
      } else {
        setImages(defaultHeroImages);
      }
      setImagesLoading(false);
    };
    fetchImages();
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    setInputValue(suggestion.name);
    setSuggestions([]);
    router.push(`/search?city=${encodeURIComponent(suggestion.city)}&lat=${suggestion.lat}&lon=${suggestion.lon}`);
  };

  const handleSearch = () => {
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-50 via-white to-green-50 py-16 px-6 md:px-16">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Text and Search Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
            Find Your Game, Your Court, Your Team.
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Seamlessly explore sports venues in Surat and play with sports enthusiasts just like you!
          </p>
          
          {/* ADDED BACK: The search input and suggestions JSX */}
          <div className="relative max-w-lg">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by city, e.g., 'Ahmedabad'"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-[100px] top-1/2 -translate-y-1/2">
                {loading && <LoaderCircle className="animate-spin text-gray-400" />}
              </div>
              <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <ul className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {suggestions.map((s, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(s)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100"
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Dynamic Image Carousel */}
        <div className="rounded-xl overflow-hidden shadow-2xl min-h-[24rem]">
          {imagesLoading ? (
            <div className="w-full h-72 md:h-96 bg-gray-300 animate-pulse"></div>
          ) : (
            <Swiper modules={[Autoplay]} autoplay={{ delay: 3000 }} loop>
              {images.map((src, i) => (
                <SwiperSlide key={i}>
                  <img src={src} alt={`Venue image ${i + 1}`} className="w-full h-72 md:h-96 object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </div>
  );
}