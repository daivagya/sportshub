"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Slot = {
  start: string;
  end: string;
  price?: number;
  isBooked: boolean;
};

type CourtPayload = {
  id: string;
  name: string;
  slug: string;
  sport?: string | null;
  currency?: string | null;
  priceSlots?: { pricePerHour?: number }[] | null;
  imageUrl?: string | null;
  averageRating?: number;
  reviewCount?: number;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function BookingPage() {
  const { venue, court } = useParams<{ venue: string; court: string }>(); // ✅ type-safe
  const router = useRouter();

  const [courtData, setCourtData] = useState<CourtPayload | null>(null);
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const abortRef = useRef<AbortController | null>(null);

  // Load availability slots
  useEffect(() => {
    if (!court || !date) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const ac = new AbortController();
    abortRef.current = ac;

    async function load() {
      setFetchingSlots(true);
      setFetchError(null);
      setSelectedSlot(null);

      try {
        const res = await fetch(
          `/api/bookingAvailability/${court}?date=${encodeURIComponent(date)}`
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Status ${res.status}`);
        }

        const data = await res.json();
        setCourtData(data.court ?? null);
        setSlots(Array.isArray(data.slots) ? data.slots : []);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to load availability:", err);
        setFetchError("Failed to load availability. Please try again.");
        toast.error("Failed to load availability");
      } finally {
        setFetchingSlots(false);
      }
    }

    load();
    return () => {
      ac.abort();
    };
  }, [court, date]);

  function markSlotBooked(start: string) {
    setSlots((prev) =>
      prev.map((s) => (s.start === start ? { ...s, isBooked: true } : s))
    );
    setSelectedSlot(null);
  }

  // Booking handler
  async function handleBooking() {
    if (!courtData) {
      toast.error("Court data is missing");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    if (date < minDate || date > maxDate) {
      toast.error("Booking must be within the next 7 days");
      return;
    }

    setBookingLoading(true);

    try {
      const idempotencyKey =
        typeof window !== "undefined" && (window.crypto as any)?.randomUUID
          ? (window.crypto as any).randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          courtSlug: courtData.slug,
          startTime: `${date}T${selectedSlot.start}:00`,
          endTime: `${date}T${selectedSlot.end}:00`,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        const msg = payload?.error || `Booking failed (${res.status})`;
        toast.error(msg);
        return;
      }

      toast.success("Booking created!");

      if (payload?.stripeCheckoutUrl) {
        setTimeout(() => {
          window.location.href = payload.stripeCheckoutUrl;
        }, 600);
        return;
      }

      markSlotBooked(selectedSlot.start);
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error("Something went wrong while booking.");
    } finally {
      setBookingLoading(false);
    }
  }

  // Rating display
  function renderRating(r?: number) {
    if (!r || r <= 0)
      return <span className="text-sm text-gray-500">No ratings</span>;
    const rounded = Math.round(r * 10) / 10;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-gray-900">⭐ {rounded}</span>
        <span className="text-gray-500">({courtData?.reviewCount ?? 0})</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="flex gap-4 items-center mb-6">
          {courtData?.imageUrl ? (
            <img
              src={courtData.imageUrl}
              alt={courtData.name}
              className="w-20 h-20 rounded-lg object-cover border border-emerald-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-semibold border border-emerald-200">
              {(
                courtData?.name
                  ?.split(" ")
                  ?.map((s) => s[0])
                  ?.slice(0, 2) || ["C"]
              ).join("")}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {courtData?.name ?? "Court"}
            </h1>
            <p className="text-sm text-gray-600">{courtData?.sport ?? ""}</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="text-sm font-medium text-emerald-700">
                Price:{" "}
                {courtData?.priceSlots?.[0]?.pricePerHour != null
                  ? `${courtData.priceSlots[0].pricePerHour} ${
                      courtData.currency ?? ""
                    }/hr`
                  : "—"}
              </div>
              {renderRating(courtData?.averageRating)}
            </div>
          </div>
        </div>

        {/* Date picker */}
        <div className="mb-6">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select date
              </label>
              <input
                type="date"
                value={date}
                min={minDate}
                max={maxDate}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Booking allowed only within next 7 days.
              </p>
            </div>

            <div className="w-56">
              <div className="text-xs font-semibold text-gray-700 mb-2">
                Legend
              </div>
              <div className="flex gap-2 items-center">
                <div className="px-2 py-1 rounded text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Available
                </div>
                <div className="px-2 py-1 rounded text-xs bg-black text-white border border-black">
                  Selected
                </div>
                <div className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 line-through border border-gray-200">
                  Booked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slots */}
        <div className="mb-6">
          <h2 className="text-md font-semibold text-gray-900 mb-3">Slots</h2>

          {fetchingSlots ? (
            <div className="py-10 text-center text-gray-600">
              Loading slots…
            </div>
          ) : fetchError ? (
            <div className="py-6 text-center text-red-600">{fetchError}</div>
          ) : slots.length === 0 ? (
            <div className="py-6 text-center text-gray-600">
              No slots for selected date.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map((s) => {
                const isSelected = selectedSlot?.start === s.start;
                const base =
                  "px-3 py-2 rounded-lg text-sm font-medium border transition flex flex-col items-center justify-center focus:outline-none focus-visible:ring-2";

                const className = s.isBooked
                  ? cx(
                      base,
                      "bg-gray-100 text-gray-500 cursor-not-allowed line-through border-gray-200"
                    )
                  : isSelected
                  ? cx(
                      base,
                      "bg-black text-white border-black shadow-sm focus-visible:ring-emerald-400"
                    )
                  : cx(
                      base,
                      "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 focus-visible:ring-emerald-400"
                    );

                return (
                  <button
                    key={s.start}
                    type="button"
                    aria-pressed={isSelected}
                    aria-disabled={s.isBooked}
                    onClick={() => !s.isBooked && setSelectedSlot(s)}
                    className={className}
                  >
                    <span>
                      {s.start} - {s.end}
                    </span>
                    {s.price != null && (
                      <span className="text-xs text-gray-600">
                        {s.price} {courtData?.currency ?? ""}
                      </span>
                    )}
                    {s.isBooked && (
                      <span className="text-xs text-gray-500 mt-1">Booked</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {slots.length > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              {slots.filter((s) => s.isBooked).length} booked ·{" "}
              {slots.filter((s) => !s.isBooked).length} available
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 items-center">
          <button
            onClick={handleBooking}
            disabled={!selectedSlot || bookingLoading}
            className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {bookingLoading ? "Booking…" : "Confirm Booking"}
          </button>

          <button
            onClick={() => setSelectedSlot(null)}
            className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
