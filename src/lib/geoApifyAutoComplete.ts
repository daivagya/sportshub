"use client"; // CRITICAL: Add this directive

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

// Suggestion interface is correctly defined and exported
export interface Suggestion {
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

// RENAMED: The function now matches the name used in your component
export function useGeoapifyAutocomplete() { 
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY; // Using OpenWeather as configured

  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.length < 3 || !apiKey) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(text)}&limit=5&appid=${apiKey}`
      );
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const formattedSuggestions: Suggestion[] = data.map((item: any) => ({
        name: `${item.name}, ${item.state ? `${item.state}, ` : ''}${item.country}`,
        city: item.name,
        country: item.country,
        lat: item.lat,
        lon: item.lon,
      }));
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions]);

  useEffect(() => {
    debouncedFetch(inputValue);
    return () => debouncedFetch.cancel();
  }, [inputValue, debouncedFetch]);

  return { inputValue, setInputValue, suggestions, loading, setSuggestions };
}