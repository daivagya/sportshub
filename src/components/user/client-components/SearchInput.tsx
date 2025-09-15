"use client";

import React, { useState, useEffect } from "react";
import { Search, LoaderCircle, MapPin, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFetch } from "../../../lib/useFetch";

// ---- API Response Types ----
interface GeoapifySuggestion {
  city?: string;
  state?: string;
  country?: string;
  name?: string;
  formatted: string;
}

interface GeoapifyResponse {
  results: GeoapifySuggestion[];
}

const SearchInput: React.FC = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  const { data, loading, error, handleFetch, setData } = useFetch<GeoapifyResponse>(
    (query) =>
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        query
      )}&format=json&apiKey=${apiKey}`
  );

  const suggestions = data?.results ?? [];
  const hasNoResults = !loading && data && suggestions.length === 0 && inputValue.length > 2;

  // Use useEffect to call the debounced function
  useEffect(() => {
    console.log(`[SearchInput] Input value changed: "${inputValue}"`);
    if (inputValue.length > 2) {
      console.log("[SearchInput] Input is long enough, calling handleFetch.");
      handleFetch(inputValue);
    } else {
      console.log("[SearchInput] Input is too short, clearing suggestions.");
      setData(null);
    }
  }, [inputValue, handleFetch, setData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelect = (suggestion: GeoapifySuggestion) => {
    const displayValue = suggestion.name || suggestion.city || suggestion.formatted;
    setInputValue(displayValue);
    setData(null);

    const city = suggestion.city;
    const query = suggestion.name || suggestion.formatted;

    router.push(city ? `/venues?city=${encodeURIComponent(city)}` : `/venues?q=${encodeURIComponent(query)}`);
  };

  const handleSearch = () => {
    if (inputValue.trim()) {
      const exactMatch = suggestions.find(s => (s.name || s.city || s.formatted) === inputValue.trim());
      if (exactMatch) {
        handleSelect(exactMatch);
      } else {
        router.push(`/venues?q=${encodeURIComponent(inputValue.trim())}`);
      }
    }
  };

  if (!apiKey) {
    return (
      <div className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
        <AlertTriangle className="flex-shrink-0 inline w-5 h-5 mr-3" />
        <span className="font-medium">Geoapify API key is missing.</span> Search is disabled.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mb-6">
      <div className="relative flex items-center w-full bg-white rounded-lg shadow-md border border-gray-200 focus-within:ring-2 focus-within:ring-green-500 transition-all">
        <input
          type="text"
          placeholder="Search by city or venue name"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full pl-4 pr-12 py-3 text-gray-700 bg-transparent border-none rounded-l-lg focus:outline-none"
        />
        {loading && (
          <div className="absolute inset-y-0 right-20 flex items-center pointer-events-none">
            <LoaderCircle className="animate-spin text-gray-400" size={20} />
          </div>
        )}
        <button
          onClick={handleSearch}
          className="flex-shrink-0 bg-green-600 text-white px-4 sm:px-5 py-3 rounded-r-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          aria-label="Search"
        >
          <Search size={20} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Suggestions List */}
      {(suggestions.length > 0 || error || hasNoResults) && (
        <ul className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
          {error && (
            <li className="px-4 py-3 text-red-600 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>Error: {error}</span>
            </li>
          )}
          {hasNoResults && (
             <li className="px-4 py-3 text-gray-500">No results found.</li>
          )}
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center gap-3"
            >
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{s.formatted}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchInput;
