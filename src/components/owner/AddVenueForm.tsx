"use client";

import { useRef, useState } from "react";

export default function AddVenueForm({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_PHOTOS = 20; // tweak if you want a cap

  const [formState, setFormState] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    amenities: [] as string[],
    photos: [] as File[],
  });

  // Helper: make a stable identity key for a File
  const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

  // Toggle amenities selection
  const toggleAmenity = (amenity: string) => {
    setFormState((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Handle photo input (robust)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) {
      // ensure input text resets
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const incomingImages = Array.from(list).filter((f) =>
      f.type?.startsWith("image/")
    );

    setFormState((prev) => {
      // de-duplicate by name+size+lastModified
      const map = new Map(prev.photos.map((f) => [fileKey(f), f]));
      for (const f of incomingImages) {
        if (map.size >= MAX_PHOTOS) break;
        map.set(fileKey(f), f);
      }
      return { ...prev, photos: Array.from(map.values()) };
    });

    // reset input so same file can be selected again later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete photo
  const deletePhoto = (index: number) => {
    setFormState((prev) => {
      const updated = prev.photos.filter((_, i) => i !== index);
      // if empty, ensure input shows "No file chosen"
      if (updated.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return { ...prev, photos: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Venue Submitted:", formState);
    onClose();
  };

  const inputClasses =
    "mt-1 w-full h-11 rounded-md border-gray-300 shadow-sm px-3 " +
    "focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm outline-none";
  const textareaClasses =
    "mt-1 w-full rounded-md border-gray-300 shadow-sm px-3 py-2 " +
    "focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm outline-none";

  const countries = [
    "India",
    "United States",
    "United Kingdom",
    "Australia",
    "Canada",
    "Germany",
    "France",
    "Japan",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
    >
      {/* Venue Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Venue Name
          </label>
          <input
            type="text"
            value={formState.name}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formState.description}
            onChange={(e) =>
              setFormState({ ...formState, description: e.target.value })
            }
            rows={4}
            className={textareaClasses}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            value={formState.address}
            onChange={(e) =>
              setFormState({ ...formState, address: e.target.value })
            }
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            value={formState.city}
            onChange={(e) =>
              setFormState({ ...formState, city: e.target.value })
            }
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            value={formState.state}
            onChange={(e) =>
              setFormState({ ...formState, state: e.target.value })
            }
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <select
            value={formState.country}
            onChange={(e) =>
              setFormState({ ...formState, country: e.target.value })
            }
            className={inputClasses}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amenities */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenities
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {["Parking", "Lights", "Washroom", "Drinking Water"].map(
            (amenity) => (
              <label
                key={amenity}
                className="flex items-center space-x-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={formState.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>{amenity}</span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Photos */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Venue Photos
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-green-50 file:text-green-700
                     hover:file:bg-green-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          You can upload up to {MAX_PHOTOS} images. Duplicates are ignored.
        </p>

        {/* Preview Section */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {formState.photos.map((photo, index) => {
            const previewUrl = URL.createObjectURL(photo);
            return (
              <div key={fileKey(photo)} className="relative group">
                <img
                  src={previewUrl}
                  alt={`venue-photo-${index}`}
                  className="w-full h-28 object-cover rounded-lg shadow"
                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                />
                <button
                  type="button"
                  onClick={() => deletePhoto(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-80 group-hover:opacity-100"
                  aria-label={`Delete photo ${photo.name}`}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm"
        >
          Save Venue
        </button>
      </div>
    </form>
  );
}
