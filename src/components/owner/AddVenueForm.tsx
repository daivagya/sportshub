"use client";

import { useState } from "react";

export default function AddVenueForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    amenities: [] as string[],
    photos: [""],
  });

  // Toggle amenities selection
  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Handle photo input
  const handlePhotoChange = (index: number, value: string) => {
    const updated = [...formData.photos];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, photos: updated }));
  };

  const addPhotoField = () => {
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ""] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Venue Submitted:", formData);
    onClose();
  };

  const inputClasses =
    "mt-1 w-full h-11 rounded-md border-gray-300 shadow-sm px-3 " +
    "focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm " +
    "outline-none"; // 👈 removes inner white border

  const textareaClasses =
    "mt-1 w-full rounded-md border-gray-300 shadow-sm px-3 py-2 " +
    "focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm " +
    "outline-none"; // 👈 removes inner white border

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
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
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
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
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
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className={inputClasses}
          />
        </div>
      </div>

      {/* Amenities (full width) */}
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
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>{amenity}</span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Photos (full width) */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Venue Photos (URLs)
        </label>
        <div className="space-y-3">
          {formData.photos.map((photo, index) => (
            <input
              key={index}
              type="text"
              value={photo}
              onChange={(e) => handlePhotoChange(index, e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className={inputClasses}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addPhotoField}
          className="mt-2 text-sm text-green-600 hover:underline"
        >
          + Add another photo
        </button>
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
