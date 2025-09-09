"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCourtById } from "@/app/(owner)/manager/_actions/court.actions";
import GAMES from "@/constants/games";
import { Court } from "@/types/next-auth";

interface PriceSlotInput {
  startTime: number;
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

  const [useTieredPricing, setUseTieredPricing] = useState<boolean>(
    (court?.priceSlots?.length ?? 0) > 1
  );
  const [fixedPrice, setFixedPrice] = useState<string>(
    court?.priceSlots?.length === 1
      ? String(court.priceSlots![0].price ?? "")
      : ""
  );
  const [priceSlots, setPriceSlots] = useState<PriceSlotInput[]>(
    (court?.priceSlots?.map((s) => ({
      startTime: s.startTime,
      price: String(s.price),
    })) ?? [{ startTime: court?.openTime ?? 8, price: "" }]) as PriceSlotInput[]
  );

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
  const availableSlotHours = allHours.filter(
    (h) => h > openTime && h < closeTime
  );

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
    setUseTieredPricing((court?.priceSlots?.length ?? 0) > 1);
    setFixedPrice(
      court?.priceSlots?.length === 1
        ? String(court.priceSlots![0].price ?? "")
        : ""
    );
    setPriceSlots(
      (court?.priceSlots?.map((s) => ({
        startTime: s.startTime,
        price: String(s.price),
      })) ?? [
        { startTime: court?.openTime ?? 8, price: "" },
      ]) as PriceSlotInput[]
    );
    setImageFile(null);
    setPreviewUrl(court?.imageUrl ?? null);
    setError(null);
  }, [isOpen, court]);

  // keep first slot aligned with openTime
  useEffect(() => {
    setPriceSlots((slots) => {
      const updated = slots.map((s, i) =>
        i === 0 ? { ...s, startTime: openTime } : s
      );
      return updated.filter((s) => s.startTime >= openTime);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTime]);

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

  const handlePriceSlotChange = (
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

  const handleAddPriceSlot = () => {
    const last = priceSlots[priceSlots.length - 1];
    const newStart = last ? last.startTime + 1 : openTime + 1;
    if (newStart >= closeTime) {
      setError("Cannot add a slot that starts at or after closing time.");
      return;
    }
    if (priceSlots.some((p) => p.startTime === newStart)) {
      setError("Slot start time conflicts with existing slot.");
      return;
    }
    setPriceSlots([...priceSlots, { startTime: newStart, price: "" }]);
    setError(null);
  };

  const handleRemovePriceSlot = (i: number) => {
    if (i === 0 || priceSlots.length <= 1) return;
    setPriceSlots((s) => s.filter((_, idx) => idx !== i));
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
    let formattedPriceSlots: PriceSlotInput[] = [];
    if (useTieredPricing) {
      const cleaned = [...priceSlots]
        .map((s) => ({
          startTime: Number(s.startTime),
          price: String(s.price).trim(),
        }))
        .sort((a, b) => a.startTime - b.startTime);

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
      formattedPriceSlots = cleaned;
    } else {
      if (!fixedPrice || Number(fixedPrice) <= 0)
        return setError("Please set a valid fixed price.");
      formattedPriceSlots = [{ startTime: openTime, price: fixedPrice }];
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
        priceSlots: formattedPriceSlots,
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

            {/* Pricing */}
            <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={useTieredPricing}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setUseTieredPricing(next);
                    // if switching to fixed, set fixedPrice from first slot
                    if (!next) {
                      setFixedPrice(priceSlots[0]?.price ?? "");
                    } else {
                      // ensure there's at least one slot
                      if (!priceSlots || priceSlots.length === 0) {
                        setPriceSlots([
                          { startTime: openTime, price: fixedPrice || "" },
                        ]);
                      }
                    }
                  }}
                />
                <span className="text-sm">Use tiered pricing</span>
              </label>

              {useTieredPricing ? (
                <div className="space-y-3">
                  {priceSlots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i === 0 ? (
                        <div className="text-center px-3 py-2 bg-gray-100 rounded-md text-sm">
                          {String(slot.startTime).padStart(2, "0")}:00
                        </div>
                      ) : (
                        <select
                          className="w-24 rounded-lg border border-gray-300 bg-white dark:bg-gray-700 px-2 py-2 text-sm"
                          value={String(slot.startTime)}
                          onChange={(e) =>
                            handlePriceSlotChange(
                              i,
                              "startTime",
                              e.target.value
                            )
                          }
                        >
                          {availableSlotHours.map((h) => (
                            <option key={h} value={h}>
                              {String(h).padStart(2, "0")}:00
                            </option>
                          ))}
                        </select>
                      )}

                      <input
                        className={`${baseInput} flex-1`}
                        type="number"
                        min={0}
                        placeholder="₹ Price"
                        value={slot.price}
                        onChange={(e) =>
                          handlePriceSlotChange(i, "price", e.target.value)
                        }
                      />

                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePriceSlot(i)}
                          className="text-red-500 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddPriceSlot}
                    className="block w-full text-blue-600 border border-blue-600 rounded-lg py-1 text-sm"
                  >
                    + Add Price Slot
                  </button>
                </div>
              ) : (
                <input
                  className={baseInput}
                  type="number"
                  placeholder="Price per hour (₹)"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                />
              )}
            </div>

            {/* Buttons placed immediately after pricing so they appear right below it and inside the scroll area */}
            <div className="pt-4 border-t dark:border-gray-700">
              {error && (
                <div className="pb-2 text-sm text-red-600">{error}</div>
              )}

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-w-[100px] px-4 py-2 rounded-lg border-2 border-green-600 text-green-700 bg-white hover:bg-green-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || imageUploading}
                  className={`min-w-[120px] px-4 py-2 rounded-lg text-white transition ${
                    loading || imageUploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 hover:ring-2 hover:ring-green-300 focus:ring-2 focus:ring-green-300"
                  }`}
                >
                  {loading ? "Updating..." : "Update Court"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}