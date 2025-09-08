"use client";

import { useState, useEffect } from "react";
import { addCourt } from "@/app/(owner)/manager/_actions/court.actions";
import { PriceSlotInput } from "@/types/next-auth";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
interface AddCourtFormProps {
  venueSlug: string;
  onClose: () => void;
}

const GAMES = [
  "Badminton",
  "Tennis",
  "Basketball",
  "Football (5-a-side)",
  "Cricket (Nets)",
  "Volleyball",
  "Table Tennis",
  "Squash",
  "Futsal",
  "Pool",
  "Chess",
  "Carrom",
  "Kabaddi",
  "Handball",
  "Throwball",
];

export function AddCourtForm({ venueSlug, onClose }: AddCourtFormProps) {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("Badminton");
  const [type, setType] = useState<"Indoor" | "Outdoor">("Indoor");
  const [useTieredPricing, setUseTieredPricing] = useState(false);
  const [fixedPrice, setFixedPrice] = useState("");
  const router = useRouter();
  // Fixed hours
  const [openTime, setOpenTime] = useState(8);
  const [closeTime, setCloseTime] = useState(22);

  // Tiered pricing slots
  const [priceSlots, setPriceSlots] = useState<PriceSlotInput[]>([
    { startTime: 8, price: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    setPriceSlots((current) => {
      const updated = [...current];
      if (updated.length > 0) updated[0].startTime = openTime;
      return updated.filter((slot) => slot.startTime >= openTime);
    });
  }, [openTime]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  // --- PRICE SLOTS MANAGEMENT ---
  const handlePriceSlotChange = (
    index: number,
    field: "startTime" | "price",
    value: string
  ) => {
    const newSlots = [...priceSlots];
    newSlots[index] = {
      ...newSlots[index],
      [field]: field === "price" ? value : Number(value),
    };
    setPriceSlots(newSlots);
  };

  const handleAddPriceSlot = () => {
    const last = priceSlots[priceSlots.length - 1];
    const newStart = last ? last.startTime + 1 : openTime + 1;
    if (newStart < closeTime) {
      setPriceSlots([...priceSlots, { startTime: newStart, price: "" }]);
      setError(null);
    } else {
      setError("Cannot add a slot that starts at or after closing time.");
    }
  };

  const handleRemovePriceSlot = (index: number) => {
    if (index === 0 || priceSlots.length <= 1) return;
    setPriceSlots(priceSlots.filter((_, i) => i !== index));
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please fill in the court name.");
      return;
    }
    if (openTime >= closeTime) {
      setError("Court 'Opens At' must be earlier than 'Closes At'.");
      return;
    }

    function generateSlug(name: string) {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // replace spaces & special chars with -
        .replace(/^-+|-+$/g, ""); // remove leading/trailing dashes
    }

    let formattedPriceSlots: PriceSlotInput[] = [];

    if (useTieredPricing) {
      const sorted = [...priceSlots].sort((a, b) => a.startTime - b.startTime);

      for (let i = 0; i < sorted.length; i++) {
        const slot = sorted[i];
        if (!slot.price || Number(slot.price) <= 0) {
          setError(
            `Please set a valid price for the slot starting at ${String(
              slot.startTime
            ).padStart(2, "0")}:00.`
          );
          return;
        }
        if (slot.startTime < openTime || slot.startTime >= closeTime) {
          setError(
            `Slot starting at ${String(slot.startTime).padStart(
              2,
              "0"
            )}:00 is outside the operating hours.`
          );
          return;
        }
        if (i > 0 && slot.startTime === sorted[i - 1].startTime) {
          setError(
            `Duplicate slot at ${String(slot.startTime).padStart(2, "0")}:00.`
          );
          return;
        }
      }
      formattedPriceSlots = sorted.map((s) => ({
        startTime: s.startTime,
        price: s.price,
      }));
    } else {
      if (!fixedPrice || Number(fixedPrice) <= 0) {
        setError("Please set a valid fixed price per hour.");
        return;
      }
      // ✅ Single slot covering open → close
      formattedPriceSlots = [{ startTime: openTime, price: fixedPrice }];
    }

    setLoading(true);
    try {
      await addCourt({
        venueSlug,
        name,
        sport,
        type,
        currency: "INR",
        openTime,
        closeTime,
        priceSlots: formattedPriceSlots,
        slug: generateSlug(name), //..............................todo
      });
      handleClose();
    } catch (err) {
      console.error("Failed to add court:", err);
      setError("Failed to add court. Please try again.");
    } finally {
      setLoading(false);
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const availableSlotHours = allHours.filter(
    (h) => h > openTime && h < closeTime
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transition-all duration-300 flex flex-col max-h-[90vh] ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Court
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-grow min-h-0"
        >
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Court name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Court Name / Number
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-style"
                placeholder="e.g., Synthetic Court 1"
                required
              />
            </div>

            {/* Sport + Type */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Sport</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="input-style"
                >
                  {GAMES.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Type</label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "Indoor" | "Outdoor")
                  }
                  className="input-style"
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </div>
            </div>

            {/* Hours */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Opens At
                </label>
                <select
                  value={openTime}
                  onChange={(e) => setOpenTime(Number(e.target.value))}
                  className="input-style"
                >
                  {allHours.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Closes At
                </label>
                <select
                  value={closeTime}
                  onChange={(e) => setCloseTime(Number(e.target.value))}
                  className="input-style"
                >
                  {allHours.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useTieredPricing}
                  onChange={(e) => setUseTieredPricing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative after:absolute after:top-0.5 after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                <span className="ml-3 text-sm">Use tiered pricing</span>
              </label>

              {useTieredPricing ? (
                <div className="space-y-4 pt-4 border-t">
                  {priceSlots.map((slot, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="col-span-5">
                        {i === 0 ? (
                          <p className="p-2.5 text-sm font-semibold">
                            {String(slot.startTime).padStart(2, "0")}:00
                          </p>
                        ) : (
                          <select
                            value={slot.startTime}
                            onChange={(e) =>
                              handlePriceSlotChange(
                                i,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="input-style"
                          >
                            {availableSlotHours.map((h) => (
                              <option key={h} value={h}>
                                {String(h).padStart(2, "0")}:00
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="col-span-5">
                        <input
                          type="number"
                          value={slot.price}
                          onChange={(e) =>
                            handlePriceSlotChange(i, "price", e.target.value)
                          }
                          className="input-style"
                          placeholder="Price (₹)"
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePriceSlot(i)}
                            className="text-red-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddPriceSlot}
                    className="w-full text-blue-600 border border-blue-600 rounded-lg py-2"
                  >
                    + Add Price Slot
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  <label className="block mb-2 text-sm">
                    Price per Hour (INR)
                  </label>
                  <input
                    type="number"
                    value={fixedPrice}
                    onChange={(e) => setFixedPrice(e.target.value)}
                    className="input-style"
                    placeholder="e.g., 500"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 mx-6 mb-4 text-sm text-red-800 bg-red-50 rounded-lg">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          <div className="flex-shrink-0 flex justify-end p-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary ml-3"
            >
              {loading ? "Adding..." : "Add Court"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
