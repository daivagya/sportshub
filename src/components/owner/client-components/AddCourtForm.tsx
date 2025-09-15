"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { addCourt } from "@/app/(owner)/manager/_actions/court.actions";
import GAMES from "@/constants/games";
import toast from "react-hot-toast";

// Interface for a single price slot
interface PriceSlotInput {
  startTime: number;
  endTime: number;
  price: string;
}

// Component props
interface AddCourtFormProps {
  venueSlug: string;
  onClose: () => void;
}

export function AddCourtForm({ venueSlug, onClose }: AddCourtFormProps) {
  // --- STATE MANAGEMENT ---

  // Core court details
  const [name, setName] = useState("");
  const [sport, setSport] = useState<string>(GAMES?.[0] ?? "Badminton");
  const [type, setType] = useState<"Indoor" | "Outdoor">("Indoor");
  const [openTime, setOpenTime] = useState<number>(8);
  const [closeTime, setCloseTime] = useState<number>(22);

  // Tiered pricing slots
  const [priceSlots, setPriceSlots] = useState<PriceSlotInput[]>([
    { startTime: openTime, endTime: closeTime, price: "" },
  ]);

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // UI and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const router = useRouter();
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  // --- EFFECTS ---

  // Effect to keep price slots in sync with the court's operating hours
  useEffect(() => {
    setPriceSlots((slots) => {
      const updatedSlots = [...slots];
      if (updatedSlots.length > 0) {
        // First slot must start at openTime
        updatedSlots[0] = { ...updatedSlots[0], startTime: openTime };
        // Last slot must end at closeTime
        updatedSlots[updatedSlots.length - 1] = {
          ...updatedSlots[updatedSlots.length - 1],
          endTime: closeTime,
        };
      }
      return updatedSlots.filter((s) => s.startTime < s.endTime);
    });
  }, [openTime, closeTime]);

  // --- HANDLERS ---

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 240); // Delay to allow for closing animation
  };

  const generateSlug = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setImageUploading(true);

    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!preset || !cloudName) {
      setImageUploading(false);
      setError("Image upload not configured. Missing Cloudinary settings.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setImageUrl(String(data.secure_url));
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Image upload failed. Check your connection.");
    } finally {
      setImageUploading(false);
    }
  };

  // --- PRICE SLOT HELPERS ---

  // Updates a slot and handles cascading changes
  const updateSlot = (
    index: number,
    field: keyof PriceSlotInput,
    value: number | string
  ) => {
    setPriceSlots((currentSlots) => {
      const newSlots = [...currentSlots];
      const numericValue = Number(value);

      newSlots[index] = { ...newSlots[index], [field]: value }; // Keep price as string

      if (field === "endTime") {
        newSlots[index] = { ...newSlots[index], [field]: numericValue };
        if (index < newSlots.length - 1) {
          newSlots[index + 1] = {
            ...newSlots[index + 1],
            startTime: numericValue,
          };
        }
      }

      return newSlots;
    });
  };

  // Adds a new price slot by splitting the last one
  const addSlot = () => {
    setError(null);
    const lastSlot = priceSlots[priceSlots.length - 1];
    const duration = lastSlot.endTime - lastSlot.startTime;

    // Prevent splitting a slot that is too short
    if (duration < 2) {
      setError(
        "Cannot split the last slot further. It must be at least 2 hours long."
      );
      return;
    }

    // Split the last slot in the middle
    const newSplitTime = lastSlot.startTime + Math.floor(duration / 2);

    const updatedLastSlot = { ...lastSlot, endTime: newSplitTime };
    const newSlot = {
      startTime: newSplitTime,
      endTime: lastSlot.endTime,
      price: "",
    };

    setPriceSlots([...priceSlots.slice(0, -1), updatedLastSlot, newSlot]);
  };
  // Removes a price slot and merges its time range into the previous slot
  const removeSlot = (index: number) => {
    if (index === 0 || priceSlots.length <= 1) return; // Cannot remove the first slot

    setPriceSlots((slots) => {
      const prevSlot = slots[index - 1];
      const currentSlot = slots[index];
      // Extend the previous slot's end time to cover the removed slot's time
      const mergedSlot = { ...prevSlot, endTime: currentSlot.endTime };

      const newSlots = [...slots];
      newSlots.splice(index, 1); // Remove the slot
      newSlots[index - 1] = mergedSlot; // Replace previous slot with the merged one
      return newSlots;
    });
  };

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validations
    if (!name.trim()) return setError("Please enter the court name.");
    if (openTime >= closeTime)
      return setError("Opening time must be before closing time.");
    if (imageUploading)
      return setError("Please wait for image upload to finish.");
    if (!imageUrl) return setError("Please upload a court image.");

    // Validate all price slots
    const cleanedSlots = priceSlots
      .map((s) => ({
        startTime: Number(s.startTime),
        endTime: Number(s.endTime),
        price: String(s.price).trim(),
      }))
      .sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < cleanedSlots.length; i++) {
      const s = cleanedSlots[i];
      if (!s.price || Number(s.price) <= 0)
        return setError(
          `Please set a valid price for the slot starting at ${s.startTime}:00.`
        );
      console.log("Price of the slot is", s.price);
      if (s.startTime < openTime || s.endTime > closeTime)
        return setError("A slot is outside operating hours.");
      if (i > 0 && s.startTime !== cleanedSlots[i - 1].endTime)
        return setError(
          "There is a gap or overlap in your time slots. Please fix it."
        );
    }

    if (
      cleanedSlots[0].startTime !== openTime ||
      cleanedSlots[cleanedSlots.length - 1].endTime !== closeTime
    ) {
      return setError(
        "Slots must cover the entire duration from open to close time."
      );
    }

    setLoading(true);
    try {
      const result = await addCourt({
        venueSlug,
        name,
        slug: generateSlug(name),
        sport,
        type,
        currency: "INR",
        openTime,
        closeTime,
        priceSlots: cleanedSlots,
        imageUrl,
      } as any);

      if (result && typeof result === "object" && "error" in result) {
        setError((result as any).error || "An unknown server error occurred.");
      } else {
        handleClose();
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error("addCourt error:", err);
      setError("Failed to add court. Please try again.");
    } finally {
      toast.success("Court created successfuly!");
      setLoading(false);
    }
  };

  // --- STYLES ---
  const inputClasses =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition";
  const selectClasses = inputClasses;
  const formatTime = (hour: number) => String(hour).padStart(2, "0") + ":00";

  // --- JSX ---
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 transition-opacity ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white min-h-0 dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]  overflow:hidden transition-transform ${
          isClosing ? "scale-95" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Add New Court</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Name, Sport, Type */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Court Name
              </label>
              <input
                className={inputClasses}
                placeholder="e.g., Synthetic Court 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Sport</label>
                <select
                  className={selectClasses}
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                >
                  {Array.isArray(GAMES) ? (
                    GAMES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))
                  ) : (
                    <option>{sport}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Type</label>
                <select
                  className={selectClasses}
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </div>
            </div>

            {/* Image Uploader */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Court Image
              </label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="court-image"
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer select-none text-sm border-green-600 text-green-600 hover:bg-green-50 transition"
                >
                  {imageUploading ? "Uploading..." : "Upload Image"}
                </label>
                <input
                  id="court-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                  disabled={imageUploading}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-28 h-20 object-cover rounded-md border"
                  />
                )}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Opens At
                </label>
                <select
                  className={selectClasses}
                  value={openTime}
                  onChange={(e) => setOpenTime(Number(e.target.value))}
                >
                  {allHours.map((h) => (
                    <option key={h} value={h}>
                      {formatTime(h)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Closes At
                </label>
                <select
                  className={selectClasses}
                  value={closeTime}
                  onChange={(e) => setCloseTime(Number(e.target.value))}
                >
                  {allHours.map((h) => (
                    <option key={h} value={h}>
                      {formatTime(h)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tiered Pricing Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="text-sm font-medium">Court Pricing (per hour)</h4>
              <div className="space-y-3">
                {priceSlots.map((slot, i) => {
                  // ADD THIS LINE: Determine the maximum valid end time for the current slot.
                  // It's either the end time of the *next* slot or the court's overall closing time.
                  const maxEndTime =
                    i < priceSlots.length - 1
                      ? priceSlots[i + 1].endTime
                      : closeTime;

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-[auto_20px_1fr_1fr_auto] gap-2 items-center"
                    >
                      <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-center dark:bg-gray-700">
                        {formatTime(slot.startTime)}
                      </div>
                      <span className="text-center text-gray-500">-</span>
                      {/* End Time Selector */}
                      {i < priceSlots.length - 1 ? (
                        <select
                          className={selectClasses}
                          value={slot.endTime}
                          onChange={(e) =>
                            updateSlot(i, "endTime", e.target.value)
                          }
                        >
                          {/* THIS FILTER IS NOW SMARTER: It prevents invalid time selections. */}
                          {allHours
                            .filter(
                              (h) => h > slot.startTime && h <= maxEndTime
                            )
                            .map((h) => (
                              <option key={h} value={h}>
                                {formatTime(h)}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-center dark:bg-gray-700">
                          {formatTime(slot.endTime)}
                        </div>
                      )}

                      {/* Price Input */}
                      <input
                        className={inputClasses}
                        type="number"
                        min={0}
                        step={10}
                        placeholder="₹ Price"
                        value={slot.price}
                        onChange={(e) => updateSlot(i, "price", e.target.value)}
                      />

                      {/* Remove Button */}
                      {i > 0 ? (
                        <button
                          type="button"
                          onClick={() => removeSlot(i)}
                          className="text-red-500 px-2 text-xl font-bold"
                        >
                          ×
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addSlot}
                  className="w-full text-blue-600 border border-blue-600 rounded-lg py-1.5 text-sm font-semibold hover:bg-blue-50 transition"
                >
                  + Add Price Tier
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 pb-2 text-sm text-red-600">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border-2 border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                loading || imageUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400"
              }`}
            >
              {loading ? "Adding..." : "Add Court"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
