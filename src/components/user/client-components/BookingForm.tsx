// "use client";

// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// interface Slot {
//   start: string;
//   end: string;
//   isBooked: boolean;
// }

// interface BookingFormProps {
//   courtSlug: string;
// }

// export default function BookingForm({ courtSlug }: BookingFormProps) {
//   const [date, setDate] = useState<string>("");
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
//   const [loading, setLoading] = useState(false);

//   // fetch slots when date changes
//   useEffect(() => {
//     if (!date) return;

//     async function fetchSlots() {
//       try {
//         const res = await fetch(
//           `/api/bookingAvailability/${courtSlug}/availability?date=${date}`
//         );
//         if (!res.ok) throw new Error("Failed to fetch availability");
//         const data = await res.json();
//         setSlots(data.slots);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load availability");
//       }
//     }

//     fetchSlots();
//   }, [date, courtSlug]);

//   async function handleBooking() {
//     if (!selectedSlot || !date) {
//       toast.error("Please select a date & slot");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/bookings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-API-KEY": process.env.NEXT_PUBLIC_INTERNAL_API_KEY || "", // ⚡ expose via NEXT_PUBLIC_ env
//           "Idempotency-Key": crypto.randomUUID(), // helps prevent double-bookings
//         },
//         body: JSON.stringify({
//           courtSlug,
//           startTime: `${date}T${selectedSlot.start}:00`,
//           endTime: `${date}T${selectedSlot.end}:00`,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         toast.error(data.error || "Booking failed");
//         return;
//       }

//       toast.success("Booking created successfully 🎉");

//       if (data.stripeCheckoutUrl) {
//         // redirect to payment
//         window.location.href = data.stripeCheckoutUrl;
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="p-4 bg-green-50 rounded-2xl shadow-md">
//       <h2 className="text-lg font-semibold mb-2">Book a Slot</h2>

//       <label className="block mb-2">
//         Select Date:
//         <input
//           type="date"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//           className="ml-2 border rounded p-1"
//         />
//       </label>

//       <div className="grid grid-cols-2 md:grid-cols-3 gap-2 my-3">
//         {slots.map((slot) => (
//           <button
//             key={slot.start}
//             disabled={slot.isBooked}
//             onClick={() => setSelectedSlot(slot)}
//             className={`p-2 rounded-lg border transition ${
//               slot.isBooked
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : selectedSlot?.start === slot.start
//                 ? "bg-green-500 text-white"
//                 : "bg-white hover:bg-green-100"
//             }`}
//           >
//             {slot.start} - {slot.end}
//           </button>
//         ))}
//       </div>

//       <button
//         onClick={handleBooking}
//         disabled={loading || !selectedSlot}
//         className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
//       >
//         {loading ? "Booking..." : "Book Now"}
//       </button>
//     </div>
//   );
// }
