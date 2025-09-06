"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Reverted to the path alias for better module resolution in Next.js.
import { createVenue } from "@/app/(owner)/manager/_actions/venue.actions";
import { uploadImagesToCloudinary } from "@/lib/cloudinary-client";
import { addVenueSchema } from "@/lib/validationFrontend";

// --- TYPE DEFINITION (THE KEY FIX) ---
// This creates a TypeScript type that perfectly matches your form's shape.
type AddVenueFormValues = z.infer<typeof addVenueSchema>;

// --- Constants ---
const AMENITIES_OPTIONS = [
  "Parking",
  "Restrooms",
  "Drinking Water",
  "Lockers",
  "First Aid",
  "Showers",
];

// --- Icon Components ---
const PlusIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);
const TrashIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
      clipRule="evenodd"
    />
  </svg>
);
const PhotoIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);
const InfoIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    />
  </svg>
);
const SparklesIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.5 18l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.5 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z"
    />
  </svg>
);

// --- Form Component ---
export default function AddVenueForm({ onClose }: { onClose?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AddVenueFormValues>({
    resolver: zodResolver(addVenueSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      amenities: [],
      photos: [], // Start with an empty array for File objects
    },
  });

  // Slug generation useEffect (no changes)
  const venueName = watch("name");
  useEffect(() => {
    if (venueName) {
      const generatedSlug = venueName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [venueName, setValue]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const addedFiles = Array.from(e.target.files || []);
    if (addedFiles.length === 0) return;

    // Get current files from the form state
    const currentFiles = watch("photos") || [];
    const combinedFiles = [...currentFiles, ...addedFiles].slice(0, 20);

    // Update the form state with the combined File objects
    setValue("photos", combinedFiles, { shouldValidate: true });

    // Create object URLs ONLY for the newly added files
    const newPreviews = addedFiles.map((file) => URL.createObjectURL(file));

    // Append new previews to the existing ones
    setImagePreviews((prevPreviews) =>
      [...prevPreviews, ...newPreviews].slice(0, 20)
    );
  };

  const removePhoto = (indexToRemove: number) => {
    // Revoke the object URL of the specific image being removed to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[indexToRemove]);

    // Update the image previews state by filtering out the removed one
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, index) => index !== indexToRemove)
    );

    // Update the react-hook-form state by filtering out the removed File object
    const updatedFiles = (watch("photos") || []).filter(
      (_, index) => index !== indexToRemove
    );
    setValue("photos", updatedFiles, { shouldValidate: true });
  };

  // Cleanup effect to revoke all URLs when the component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach((fileUrl) => URL.revokeObjectURL(fileUrl));
    };
  }, [imagePreviews]);

  // ====================================================================
  // --- MODIFIED: onSubmit Function ---
  // ====================================================================
  const onSubmit = async (data: AddVenueFormValues) => {
    setIsLoading(true);

    try {
      // 1. Upload images to Cloudinary and get URLs
      const uploadedImageUrls = await uploadImagesToCloudinary(data.photos);

      // 2. Prepare the payload for your server action
      const venuePayload = {
        ...data, // includes name, description, city, etc.
        amenities: data.amenities || [],
        photos: uploadedImageUrls, // Use the new URLs
      };

      // 3. Call the server action with the correct payload
      const result = await createVenue(venuePayload);

      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(result.success || "Venue created successfully!");
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Failed to create venue:", error);
      alert(
        "An unexpected error occurred during image upload or venue creation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-slate-100 p-4 sm:p-6 rounded-lg"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="flex items-center text-xl font-bold text-gray-800 mb-4">
              <InfoIcon className="w-6 h-6 mr-3 text-green-600" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Venue Name *
                  </label>
                  <input
                    {...register("name")}
                    className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                    placeholder="e.g., Elite Sports Complex"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    City *
                  </label>
                  <input
                    {...register("city")}
                    className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                    placeholder="e.g., Mumbai"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                  placeholder="Tell us about your venue..."
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Address *
                </label>
                <input
                  {...register("address")}
                  className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                  placeholder="e.g., 123 Sports Street, Andheri West"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    State
                  </label>
                  <input
                    {...register("state")}
                    className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                    placeholder="e.g., Maharashtra"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Country
                  </label>
                  <input
                    {...register("country")}
                    className="mt-1 w-full p-2 bg-gray-100 border-b-2 border-gray-200"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="flex items-center text-xl font-bold text-gray-800 mb-4">
              <SparklesIcon className="w-6 h-6 mr-3 text-green-600" />
              Amenities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITIES_OPTIONS.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-green-50 transition"
                >
                  <input
                    type="checkbox"
                    value={amenity}
                    {...register("amenities")}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky top-6 self-start space-y-6">
          {/* Photo Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Venue Photos *
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 20 && (
                <label className="flex flex-col justify-center items-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-md text-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <PhotoIcon className="h-6 w-6 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-500">Add</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {errors.photos && (
              <p className="mt-2 text-xs text-red-600">
                {errors?.photos.message}
              </p>
            )}
          </div>

          <input type="hidden" {...register("slug")} />
          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-4">
              Please review all sections before submitting the form.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-green-200"
              >
                {isLoading ? "Submitting..." : "Create Venue"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
