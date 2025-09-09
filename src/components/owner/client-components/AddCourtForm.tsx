"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { addCourt } from "@/app/(owner)/manager/_actions/court.actions";
import GAMES from "@/constants/games";

interface PriceSlotInput {
  startTime: number;
  price: string;
}

interface AddCourtFormProps {
  venueSlug: string;
  onClose: () => void;
}

export function AddCourtForm({ venueSlug, onClose }: AddCourtFormProps) {
  // core fields
  const [name, setName] = useState("");
  const [sport, setSport] = useState<string>(GAMES?.[0] ?? "Badminton");
  const [type, setType] = useState<"Indoor" | "Outdoor">("Indoor");
  const [openTime, setOpenTime] = useState<number>(8);
  const [closeTime, setCloseTime] = useState<number>(22);

  // pricing
  const [useTieredPricing, setUseTieredPricing] = useState(false);
  const [fixedPrice, setFixedPrice] = useState<string>("");
  const [priceSlots, setPriceSlots] = useState<PriceSlotInput[]>([
    { startTime: 8, price: "" },
  ]);

  // image
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // ui / state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const router = useRouter();
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  // keep first slot aligned to openTime and filter out invalid ones
  useEffect(() => {
    setPriceSlots((slots) =>
      slots
        .map((s, i) => (i === 0 ? { ...s, startTime: openTime } : s))
        .filter((s) => s.startTime >= openTime)
    );
  }, [openTime]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 240);
  };

  // ---------- IMAGE UPLOAD ----------
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // preview immediately
    setPreviewUrl(URL.createObjectURL(file));
    setImageUploading(true);

    // Basic env checks
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

      if (!res.ok) {
        const text = await res.text();
        console.error("Cloudinary upload failed:", res.status, text);
        setError("Image upload failed. Try again.");
        setImageUploading(false);
        return;
      }

      const data = await res.json();
      if (!data?.secure_url) {
        console.error("Cloudinary response missing secure_url:", data);
        setError("Image upload failed (invalid response).");
        setImageUploading(false);
        return;
      }

      setImageUrl(String(data.secure_url));
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Image upload failed. Check your connection.");
    } finally {
      setImageUploading(false);
    }
  };

  function validatePriceInput(value: string): string {
    if (!value) return "";
    const num = parseInt(value, 10);
    if (isNaN(num)) return "";

    // Round down to nearest 10
    return Math.round(num / 10) * 10 + "";
  }
  // ---------- PRICE SLOTS helpers ----------
  const updateSlot = (
    i: number,
    field: "startTime" | "price",
    value: string
  ) => {
    setPriceSlots((slots) =>
      slots.map((s, idx) =>
        idx === i
          ? { ...s, [field]: field === "price" ? value : Number(value) }
          : s
      )
    );
  };

  const addSlot = () => {
    const last = priceSlots[priceSlots.length - 1];
    const newStart = last ? last.startTime + 1 : openTime + 1;
    if (newStart >= closeTime) {
      setError("Cannot add a slot that starts at or after closing time.");
      return;
    }
    // prevent duplicate startTime
    if (priceSlots.some((p) => p.startTime === newStart)) {
      setError("Slot start time conflicts with existing slot.");
      return;
    }
    setPriceSlots([...priceSlots, { startTime: newStart, price: "" }]);
    setError(null);
  };

  const removeSlot = (i: number) => {
    if (i === 0 || priceSlots.length <= 1) return; // keep first slot
    setPriceSlots((s) => s.filter((_, idx) => idx !== i));
  };

  // ---------- SLUG helper ----------
  const generateSlug = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // ---------- SUBMIT ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // basic validations
    if (!name.trim()) return setError("Please enter the court name.");
    if (openTime >= closeTime)
      return setError("Opening time must be earlier than closing time.");
    if (imageUploading)
      return setError("Please wait for image upload to finish.");
    if (!imageUrl)
      return setError("Please upload a cover image for the court.");

    // prepare slots
    let slots: PriceSlotInput[] = [];
    if (useTieredPricing) {
      const cleaned = priceSlots
        .map((s) => ({
          startTime: Number(s.startTime),
          price: String(s.price).trim(),
        }))
        .sort((a, b) => a.startTime - b.startTime);

      // validations: price positive, within hours, no dupes
      for (let i = 0; i < cleaned.length; i++) {
        const s = cleaned[i];
        if (!s.price || Number(s.price) <= 0)
          return setError("Please set valid prices for all slots.");
        if (s.startTime < openTime || s.startTime >= closeTime)
          return setError(
            `Slot at ${String(s.startTime).padStart(
              2,
              "0"
            )}:00 is outside operating hours.`
          );
        if (i > 0 && s.startTime === cleaned[i - 1].startTime)
          return setError(
            `Duplicate slot at ${String(s.startTime).padStart(2, "0")}:00.`
          );
      }
      slots = cleaned;
    } else {
      if (!fixedPrice || Number(fixedPrice) <= 0)
        return setError("Please set a valid fixed price per hour.");
      slots = [{ startTime: openTime, price: fixedPrice }];
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
        priceSlots: slots,
        imageUrl,
      } as any); // `addCourt` shape depends on your server action - cast if needed

      // handle possible server-side error shape
      if (result && typeof result === "object" && "error" in result) {
        const msg =
          (result as any).error || "Server error while creating court";
        setError(String(msg));
        setLoading(false);
        return;
      }

      // success
      handleClose();
      startTransition(() => router.refresh());
    } catch (err) {
      console.error("addCourt error:", err);
      setError("Failed to add court. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // small UI helpers
  const inputClasses =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

  const selectClasses = inputClasses;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 transition-opacity ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] transition-transform ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Add New Court</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* name */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Court Name / Number
              </label>
              <input
                className={inputClasses}
                placeholder="e.g., Synthetic Court 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* sport & type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Sport</label>
                <select
                  className={selectClasses}
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                >
                  {Array.isArray(GAMES) ? (
                    GAMES.map((g: string) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))
                  ) : (
                    <option>{String(sport)}</option>
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

            {/* image uploader */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Court Image
              </label>

              {/* visually-styled upload control */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="court-image"
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer select-none text-sm
                            border-green-600 text-green-600 hover:bg-green-50 transition"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 3v12"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 7l4-4 4 4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="3"
                      y="10"
                      width="18"
                      height="11"
                      rx="2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>
                    {imageUploading
                      ? "Uploading..."
                      : imageUrl
                      ? "Change image"
                      : "Upload image"}
                  </span>
                </label>

                <input
                  id="court-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />

                {/* small preview badge */}
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-28 h-20 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-28 h-20 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500">
                    No image
                  </div>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Recommended: 1200×800 px. Max size: 5MB.
              </p>
            </div>

            {/* hours */}
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
                  className={selectClasses}
                  value={closeTime}
                  onChange={(e) => setCloseTime(Number(e.target.value))}
                >
                  {allHours.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* pricing */}
            <div className="space-y-4 border rounded-lg p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={useTieredPricing}
                  onChange={(e) => setUseTieredPricing(e.target.checked)}
                />
                <span className="text-sm">Use tiered pricing</span>
              </label>

              {useTieredPricing ? (
                <div className="space-y-3">
                  {priceSlots.map((slot, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      {i === 0 ? (
                        <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-center">
                          {String(slot.startTime).padStart(2, "0")}:00
                        </div>
                      ) : (
                        <select
                          className="w-24 rounded-lg border border-gray-300 bg-white dark:bg-gray-700 px-2 py-2 text-sm"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateSlot(
                              i,
                              "price",
                              validatePriceInput(e.target.value)
                            )
                          }
                        >
                          {allHours
                            .filter((h) => h >= openTime && h < closeTime)
                            .map((h) => (
                              <option key={h} value={h}>
                                {String(h).padStart(2, "0")}:00
                              </option>
                            ))}
                        </select>
                      )}

                      <input
                        className="input-style w-full flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        type="number"
                        min={0}
                        placeholder="₹ Price"
                        value={slot.price}
                        onChange={(e) =>
                          setFixedPrice(validatePriceInput(e.target.value))
                        }
                      />

                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(i)}
                          className="text-red-500 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSlot}
                    className="block w-full text-blue-600 border border-blue-600 rounded-lg py-1 text-sm"
                  >
                    + Add Slot
                  </button>
                </div>
              ) : (
                <input
                  className="input-style rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  type="number"
                  placeholder="Price per hour (₹)"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="px-6 pb-2 text-sm text-red-600">{error}</div>
          )}

          {/* actions */}
          <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
            {/* Cancel: outlined green */}
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border-2 border-green-600 text-green-700 hover:bg-green-50 transition"
            >
              Cancel
            </button>

            {/* Add: solid green with blue hover ring */}
            <button
              type="submit"
              disabled={loading || imageUploading}
              className={`px-4 py-2 rounded-lg text-white transition ${
                loading || imageUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-300"
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

export default AddCourtForm;
