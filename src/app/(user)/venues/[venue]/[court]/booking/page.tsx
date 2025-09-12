"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getAvailabilityForCourt } from "@/app/(user)/_userActions/court.actions";
import { CalendarDays, Clock, Sun, Sunset, Moon, Star, IndianRupee } from "lucide-react";
import dayjs from "dayjs";

type Slot = {
  start: string;
  end: string;
  price?: number;
  isBooked: boolean;
};

type CourtPayload = {
  id: number;
  name: string;
  slug: string;
  sport?: string | null;
  currency?: string | null;
  imageUrl?: string | null;
  averageRating?: number;
  reviewCount?: number;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SlotsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-6 w-28 bg-gray-200 rounded-md mb-3"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <div>
        <div className="h-6 w-32 bg-gray-200 rounded-md mb-3"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { court } = useParams<{ court: string }>();
  // const router = useRouter();
  const [courtData, setCourtData] = useState<CourtPayload | null>(null);
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [fetchingSlots, setFetchingSlots] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const dates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, "day"));
  console.log("Court-------->from booking/page.tsx of user:", court);
  useEffect(() => {
    if (!court || !date) return;

    const loadAvailability = async () => {
      setFetchingSlots(true);
      setFetchError(null);
      setSelectedSlot(null);
      try {
        const result = await getAvailabilityForCourt(court, date);
        if (result.success && result.data) {
          setCourtData(result.data.court as CourtPayload);
          setSlots(result.data.slots);
        } else {
          throw new Error(result.error || "Failed to load availability.");
        }
      } catch (err: any) {
        setFetchError(err.message || "Please try again.");
        toast.error(err.message);
      } finally {
        setFetchingSlots(false);
      }
    };

    loadAvailability();
  }, [court, date]);

  const handleBooking = async () => {
    if (!courtData || !selectedSlot) {
      return toast.error("Please select a slot to book.");
    }
    setBookingLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
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
      console.log("Booking response:", res);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Booking failed.");
      console.log("Booking successful:", payload);
      toast.success("Booking created! Redirecting to payment...");
      if (payload?.stripeSessionUrl) {
        setTimeout(() => {
          window.location.href = payload.stripeSessionUrl;
        }, 600);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const groupedSlots = {
    Morning: slots.filter(s => parseInt(s.start.split(":")[0], 10) < 12),
    Afternoon: slots.filter(s => parseInt(s.start.split(":")[0], 10) >= 12 && parseInt(s.start.split(":")[0], 10) < 17),
    Evening: slots.filter(s => parseInt(s.start.split(":")[0], 10) >= 17),
  };

  const formatTime = (time24: string) => dayjs(`1970-01-01T${time24}`).format("hh:mm A");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="relative h-48 md:h-64 w-full">
            <img
              src={courtData?.imageUrl || "/images/placeholder-venue.jpg"}
              alt={courtData?.name || "Court"}
              className="w-full h-full object-cover rounded-t-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {courtData?.name ?? "Loading Court..."}
              </h1>
              <p className="text-lg text-white/90">{courtData?.sport}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 grid md:grid-cols-[2fr_1fr] gap-8 items-start">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                  Select a Date
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setDate(d.format("YYYY-MM-DD"))}
                      className={cx(
                        "flex-shrink-0 text-center px-4 py-2 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                        d.isSame(date, "day")
                          ? "bg-blue-600 border-blue-600 text-white font-semibold shadow-md"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                      )}
                    >
                      <p className="text-sm font-medium">{d.format("ddd")}</p>
                      <p className="text-lg font-bold">{d.format("D")}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Choose an Available Slot
                </h2>
                {fetchingSlots ? (
                  <SlotsSkeleton />
                ) : fetchError ? (
                  <div className="py-6 text-center text-red-600">{fetchError}</div>
                ) : slots.every(s => s.isBooked) ? (
                  <div className="py-6 text-center text-gray-600">No available slots for the selected date.</div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedSlots).map(([groupName, groupSlots]) => 
                      groupSlots.length > 0 && (
                        <div key={groupName}>
                          <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 mb-3">
                            {groupName === 'Morning' && <Sun className="w-5 h-5 text-orange-500" />}
                            {groupName === 'Afternoon' && <Sunset className="w-5 h-5 text-yellow-500" />}
                            {groupName === 'Evening' && <Moon className="w-5 h-5 text-indigo-500" />}
                            {groupName}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {groupSlots.map((s) => {
                              const isSelected = selectedSlot?.start === s.start;
                              return (
                                <button
                                  key={s.start}
                                  type="button"
                                  disabled={s.isBooked}
                                  onClick={() => setSelectedSlot(s)}
                                  className={cx(
                                    "p-2 rounded-lg text-sm border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex flex-col items-center justify-center text-center h-20",
                                    s.isBooked && "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed",
                                    !s.isBooked && isSelected && "bg-blue-600 border-blue-600 text-white font-bold shadow-lg -translate-y-1",
                                    !s.isBooked && !isSelected && "bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:-translate-y-1"
                                  )}
                                >
                                  <span className="font-semibold">{formatTime(s.start)}</span>
                                  {s.price != null && <span className="text-xs mt-1">₹{s.price}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="md:sticky md:top-24 space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-800">Court:</span> {courtData?.name}</p>
                  <p><span className="font-medium text-gray-800">Date:</span> {dayjs(date).format("dddd, MMMM D, YYYY")}</p>
                  <div className="pt-2 mt-2 border-t">
                    {selectedSlot ? (
                      <>
                        <p><span className="font-medium text-gray-800">Time:</span> {formatTime(selectedSlot.start)}</p>
                        <p className="font-bold text-xl text-blue-600 mt-2">Total: ₹{selectedSlot.price}</p>
                      </>
                    ) : (
                      <p>Please select a time slot.</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleBooking}
                disabled={!selectedSlot || bookingLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg transition-all shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed"
              >
                {bookingLoading ? "Processing..." : `Book for ₹${selectedSlot?.price ?? ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}