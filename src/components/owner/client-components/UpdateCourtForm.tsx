"use client";

import { useState, useEffect, startTransition } from "react";
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

export default function UpdateCourtModal({ court, isOpen, onClose }: UpdateCourtFormProps) {
  const router = useRouter();
  const [name, setName] = useState(court.name ?? "");
  const [sport, setSport] = useState(court.sport ?? "Badminton");
  const [type, setType] = useState<string>(court.type ?? "Indoor");
  const [useTieredPricing, setUseTieredPricing] = useState((court.priceSlots?.length ?? 0) > 1);
  const [fixedPrice, setFixedPrice] = useState(
    court.priceSlots?.length === 1 ? String(court.priceSlots[0].price ?? "") : ""
  );
  const [openTime, setOpenTime] = useState(court.openTime ?? 8);
  const [closeTime, setCloseTime] = useState(court.closeTime ?? 22);
  const [priceSlots, setPriceSlots] = useState<PriceSlotInput[]>(
    court.priceSlots?.map((s) => ({ startTime: s.startTime, price: String(s.price) })) ?? [
      { startTime: openTime, price: "" },
    ]
  );

  // Image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(court.imageUrl ?? null);

  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : court.imageUrl ?? null);
  };

  const handlePriceSlotChange = (index: number, field: "startTime" | "price", value: string) => {
    const updated = [...priceSlots];
    updated[index] = {
      ...updated[index],
      [field]: field === "price" ? value : Number(value),
    };
    setPriceSlots(updated);
  };

  const handleAddPriceSlot = () => {
    const last = priceSlots[priceSlots.length - 1];
    const newStart = last.startTime + 1;
    if (newStart < closeTime) setPriceSlots([...priceSlots, { startTime: newStart, price: "" }]);
    else setError("Cannot add slot at or after closing time.");
  };

  const handleRemovePriceSlot = (index: number) => {
    if (index === 0 || priceSlots.length <= 1) return;
    setPriceSlots(priceSlots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Court name required.");
    if (openTime >= closeTime) return setError("Open time must be before close time.");

    let formattedPriceSlots: PriceSlotInput[] = [];

    if (useTieredPricing) {
      const sorted = [...priceSlots].sort((a, b) => a.startTime - b.startTime);
      for (let i = 0; i < sorted.length; i++) {
        const slot = sorted[i];
        if (!slot.price || Number(slot.price) <= 0)
          return setError(`Set valid price for slot at ${slot.startTime}:00`);
        if (slot.startTime < openTime || slot.startTime >= closeTime)
          return setError(`Slot ${slot.startTime}:00 outside operating hours`);
        if (i > 0 && slot.startTime === sorted[i - 1].startTime)
          return setError(`Duplicate slot at ${slot.startTime}:00`);
      }
      formattedPriceSlots = sorted;
    } else {
      if (!fixedPrice || Number(fixedPrice) <= 0) return setError("Set valid fixed price");
      formattedPriceSlots = [{ startTime: openTime, price: fixedPrice }];
    }

    let uploadedImageUrl: string | null = court.imageUrl ?? null;
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        uploadedImageUrl = data.secure_url;
      } catch {
        return setError("Image upload failed");
      }
    }

    setLoading(true);
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
      });
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update court. Try again.");
    } finally {
      setLoading(false);
      startTransition(() => router.refresh());
    }
  };

  if (!isOpen) return null;

  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const availableSlotHours = allHours.filter((h) => h > openTime && h < closeTime);

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
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Update Court</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Court Name */}
            <div>
              <label className="block mb-2 text-sm font-medium">Court Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-style"
                required
              />
            </div>

            {/* Sport + Type */}
            <div className="grid grid-cols-2 gap-6">
              <select value={sport} onChange={(e) => setSport(e.target.value)} className="input-style">
                {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={type} onChange={(e) => setType(e.target.value as "Indoor" | "Outdoor")} className="input-style">
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block mb-2 text-sm font-medium">Court Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full" />
              {previewUrl && <img src={previewUrl} alt="Preview" className="mt-3 w-full h-40 object-cover rounded-lg border" />}
            </div>

            {/* Hours */}
            <div className="grid grid-cols-2 gap-6">
              <select value={openTime} onChange={(e) => setOpenTime(Number(e.target.value))} className="input-style">
                {allHours.map((h) => <option key={h} value={h}>{h}:00</option>)}
              </select>
              <select value={closeTime} onChange={(e) => setCloseTime(Number(e.target.value))} className="input-style">
                {allHours.map((h) => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>

            {/* Pricing */}
            <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={useTieredPricing} onChange={(e) => setUseTieredPricing(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative after:absolute after:top-0.5 after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                <span className="ml-3 text-sm">Use tiered pricing</span>
              </label>
              {useTieredPricing ? (
                <div className="space-y-4 pt-4 border-t">
                  {priceSlots.map((slot, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                      <div className="col-span-5">
                        {i === 0 ? <p>{slot.startTime}:00</p> : (
                          <select value={slot.startTime} onChange={(e) => handlePriceSlotChange(i, "startTime", e.target.value)}>
                            {availableSlotHours.map((h) => <option key={h} value={h}>{h}:00</option>)}
                          </select>
                        )}
                      </div>
                      <div className="col-span-5">
                        <input type="number" value={slot.price} onChange={(e) => handlePriceSlotChange(i, "price", e.target.value)} className="input-style" placeholder="Price" />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {i > 0 && <button type="button" onClick={() => handleRemovePriceSlot(i)} className="text-red-500">✕</button>}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddPriceSlot} className="w-full text-blue-600 border rounded-lg py-2">+ Add Price Slot</button>
                </div>
              ) : (
                <input type="number" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} className="input-style" placeholder="Price per hour" />
              )}
            </div>
          </div>

          {error && <div className="p-4 mx-6 mb-4 text-sm text-red-800 bg-red-50 rounded-lg">{error}</div>}

          <div className="flex justify-end p-6 border-t">
            <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary ml-3">{loading ? "Updating..." : "Update Court"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
