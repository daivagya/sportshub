"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCourtById } from "@/app/(owner)/manager/_actions/court.actions";
import GAMES from "@/constants/games";
import { Court } from "@/types/next-auth";

interface PriceSlotInput {
  startTime: number;
  endTime: number;
  price: string;
}

interface UpdateCourtFormProps {
  court: Court;
  onClose: () => void;
  isOpen: boolean;
}

export default function UpdateCourtModal({
  court,
  isOpen,
  onClose,
}: UpdateCourtFormProps) {
  const router = useRouter();

  // --- form state (initialized from court when modal opens) ---
  const [name, setName] = useState<string>(court?.name ?? "");
  const [sport, setSport] = useState<string>(
    court?.sport ?? GAMES?.[0] ?? "Badminton"
  );
  const [type, setType] = useState<"Indoor" | "Outdoor">(
    (court?.type as "Indoor" | "Outdoor") ?? "Indoor"
  );
  const [openTime, setOpenTime] = useState<number>(court?.openTime ?? 8);
  const [closeTime, setCloseTime] = useState<number>(court?.closeTime ?? 22);

  const [priceSlots, setPriceSlots] = useState<PriceSlotInput[]>([]);

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    court?.imageUrl ?? null
  );
  const [imageUploading, setImageUploading] = useState(false);

  // misc
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // utility
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  // base input styling (consistent)
  const baseInput =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

  // Re-init state whenever modal opens (so repeated opens show fresh data)
  useEffect(() => {
    if (!isOpen) return;
    setName(court?.name ?? "");
    setSport(court?.sport ?? GAMES?.[0] ?? "Badminton");
    setType((court?.type as "Indoor" | "Outdoor") ?? "Indoor");
    setOpenTime(court?.openTime ?? 8);
    setCloseTime(court?.closeTime ?? 22);
    setPriceSlots(
      court.priceSlots.length > 0
        ? court.priceSlots.map((s) => ({
            ...s,
            price: String(s.pricePerHour),
          }))
        : [{ startTime: court.openTime, endTime: court.closeTime, price: "" }]
    );
    setImageFile(null);
    setPreviewUrl(court?.imageUrl ?? null);
    setError(null);
  }, [isOpen, court]);

  // keep price slots aligned with open/close times
  useEffect(() => {
    if (!priceSlots.length) return;

    setPriceSlots((slots) => {
      const updated = [...slots];
      updated[0].startTime = openTime;
      updated[updated.length - 1].endTime = closeTime;
      return updated.filter((s) => s.startTime < s.endTime);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTime, closeTime]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 260);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : court?.imageUrl ?? null);
  };

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

  const addSlot = () => {
    setError(null);
    const lastSlot = priceSlots[priceSlots.length - 1];
    const duration = lastSlot.endTime - lastSlot.startTime;

    if (duration < 2) {
      setError(
        "Cannot split the last slot further. It must be at least 2 hours long."
      );
      return;
    }

    const newSplitTime = lastSlot.startTime + Math.floor(duration / 2);

    const updatedLastSlot = { ...lastSlot, endTime: newSplitTime };
    const newSlot = {
      startTime: newSplitTime,
      endTime: lastSlot.endTime,
      price: "",
    };

    setPriceSlots([...priceSlots.slice(0, -1), updatedLastSlot, newSlot]);
  };

  const removeSlot = (index: number) => {
    if (index === 0 || priceSlots.length <= 1) return;

    setPriceSlots((slots) => {
      const prevSlot = slots[index - 1];
      const currentSlot = slots[index];
      const mergedSlot = { ...prevSlot, endTime: currentSlot.endTime };

      const newSlots = [...slots];
      newSlots.splice(index, 1);
      newSlots[index - 1] = mergedSlot;
      return newSlots;
    });
  };

  // submit: uploads image (if changed) then calls updateCourtById
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Court name required.");
    if (openTime >= closeTime)
      return setError("Open time must be before close time.");
    if (imageUploading) return setError("Please wait for the image upload.");

    // validate price slots
    const cleanedSlots = priceSlots
      .map((s) => ({
        ...s,
        price: String(s.price).trim(),
      }))
      .sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < cleanedSlots.length; i++) {
      const s = cleanedSlots[i];
      if (!s.price || Number(s.price) <= 0)
        return setError(
          `Please set a valid price for the slot starting at ${s.startTime}:00.`
        );
      if (s.startTime < openTime || s.endTime > closeTime)
        return setError("A slot is outside operating hours.");
      if (i > 0 && s.startTime !== cleanedSlots[i - 1].endTime)
        return setError(
          "There is a gap or overlap in your time slots. Please fix it."
        );
    }
    if (
      cleanedSlots.length > 0 &&
      (cleanedSlots[0].startTime !== openTime ||
        cleanedSlots[cleanedSlots.length - 1].endTime !== closeTime)
    ) {
      return setError(
        "Slots must cover the entire duration from open to close time."
      );
    }
    if (cleanedSlots.length === 0) {
      return setError("At least one price slot is required.");
    }

    setLoading(true);

    // Upload image if user selected a new file
    let uploadedImageUrl: string | null = court?.imageUrl ?? null;
    if (imageFile) {
      const preset =
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET ||
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!preset || !cloudName) {
        setLoading(false);
        return setError(
          "Image upload not configured (missing Cloudinary keys)."
        );
      }

      setImageUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("upload_preset", preset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: fd }
        );

        if (!res.ok) {
          setImageUploading(false);
          setLoading(false);
          return setError("Image upload failed. Try again.");
        }

        const data = await res.json();
        if (!data?.secure_url) {
          setImageUploading(false);
          setLoading(false);
          return setError("Invalid image upload response.");
        }
        uploadedImageUrl = String(data.secure_url);
      } catch (err) {
        console.error(err);
        setImageUploading(false);
        setLoading(false);
        return setError("Image upload failed. Check your connection.");
      } finally {
        setImageUploading(false);
      }
    }

    // call update API
    try {
      await updateCourtById({
        id: court.id,
        name,
        sport,
        type,
        openTime,
        closeTime,
        priceSlots: cleanedSlots,
        imageUrl: uploadedImageUrl!,
      } as any);

      handleClose();

      // refresh so manager sees updated image on details page
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      setError("Failed to update court. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatTime = (hour: number) => String(hour).padStart(2, "0") + ":00";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 transition-opacity ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col min-h-0 overflow-hidden transition-transform ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Update Court
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Form (flex column, body scrolls) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Court Name
              </label>
              <input
                className={baseInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Synthetic Court 1"
              />
            </div>

            {/* sport + type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sport
                </label>
                <select
                  className={baseInput}
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
                    <option>{String(sport)}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  className={baseInput}
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "Indoor" | "Outdoor")
                  }
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </div>
            </div>

            {/* Image upload (compact) */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Court Image
              </label>

              <div className="flex items-center gap-4">
                <label
                  htmlFor="update-court-image"
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer text-sm
                             border-green-600 text-green-600 hover:bg-green-50 transition"
                >
                  <span>
                    {imageFile
                      ? "Change image"
                      : previewUrl
                      ? "Change image"
                      : "Upload image"}
                  </span>
                </label>

                <input
                  id="update-court-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />

                <div className="w-32 h-24 flex items-center justify-center rounded-md border overflow-hidden bg-white dark:bg-gray-700">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-400">No image</div>
                  )}
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Recommended: 1200×800 px. Max size: 5MB.
              </p>
            </div>

            {/* hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Opens At
                </label>
                <select
                  className={baseInput}
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
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Closes At
                </label>
                <select
                  className={baseInput}
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

            {/* Tiered Pricing Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="text-sm font-medium">Court Pricing (per hour)</h4>
              <div className="space-y-3">
                {priceSlots.map((slot, i) => {
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
                          className={baseInput}
                          value={slot.endTime}
                          onChange={(e) =>
                            updateSlot(i, "endTime", e.target.value)
                          }
                        >
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
                        className={baseInput}
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
          <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
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
              {loading ? "Updating..." : "Update Court"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
