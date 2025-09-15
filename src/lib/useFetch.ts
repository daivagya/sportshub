"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { debounce } from "lodash";

export function useFetch<T>(urlBuilder: (query: string) => string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);

      const url = urlBuilder(query);
      console.log(`[useFetch] Attempting to fetch: ${url}`);

      try {
        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to fetch: ${res.status} ${res.statusText} - ${errorText}`
          );
        }

        const result = (await res.json()) as T;
        setData(result);
      } catch (err: unknown) {
        console.error("[useFetch] Fetch error:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }

        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [urlBuilder]
  );

  const handleFetch = useMemo(() => debounce(fetchData, 350), [fetchData]);

  useEffect(() => {
    return () => {
      handleFetch.cancel();
    };
  }, [handleFetch]);

  return { data, loading, error, handleFetch, setData };
}
