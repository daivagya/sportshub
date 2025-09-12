"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createVenue } from "@/app/(owner)/manager/_actions/venue.actions";
import { uploadImagesToCloudinary } from "@/lib/cloudinary-client";
import { addVenueSchema } from "@/lib/validationFrontend";
import { Trash2, Image as ImageIcon, Info, Sparkles } from "lucide-react";

type AddVenueFormValues = z.infer<typeof addVenueSchema>;

const AMENITIES_OPTIONS = [
  "Parking",
  "Restrooms",
  "Drinking Water",
  "Lockers",
  "First Aid",
  "Showers",
];

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
      city: "Surat",
      state: "Gujarat",
      country: "India",
      amenities: [],
      photos: [],
    },
  });

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
    const addedFiles = Array.from(e.target.files ?? []);
    if (addedFiles.length === 0) return;
    const currentFiles = (watch("photos") as File[] | undefined) ?? [];
    const combinedFiles = [...currentFiles, ...addedFiles].slice(0, 20);
    setValue("photos", combinedFiles, { shouldValidate: true });
    const newPreviews = addedFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 20));
  };

  const removePhoto = (indexToRemove: number) => {
    if (!imagePreviews[indexToRemove]) return;
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    const updatedFiles = ((watch("photos") as File[] | undefined) ?? []).filter(
      (_, i) => i !== indexToRemove
    );
    setValue("photos", updatedFiles, { shouldValidate: true });
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imagePreviews]);

  const onSubmit = async (data: AddVenueFormValues) => {
    setIsLoading(true);
    try {
      const uploadedImageUrls = await uploadImagesToCloudinary(
        (data.photos as File[]) ?? []
      );

      const payload = {
        ...data,
        photos: uploadedImageUrls,
        amenities: data.amenities ?? [],
      };

      const result = await createVenue(payload as any);

      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(result.success || "Venue created successfully!");
        if (onClose) onClose();
      }
    } catch (err) {
      console.error("Failed to create venue:", err);
      alert("An unexpected error occurred. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = (field: any) => {
    if (!field) return null;
    if (typeof field === "string") return field;
    return field.message ?? null;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-slate-100 p-4 sm:p-6 rounded-lg"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="flex items-center text-xl font-bold text-gray-800 mb-4">
              <Info className="w-6 h-6 mr-3 text-green-600" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Venue Name *
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Venue name is required" })}
                  className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                  placeholder="e.g., Elite Sports Complex"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {renderError(errors.name)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  City *
                </label>
                <input
                  type="text"
                  {...register("city", { required: "City is required" })}
                  className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                  placeholder="e.g., Mumbai"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600">
                    {renderError(errors.city)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600">
                Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                rows={3}
                className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                placeholder="Tell us about your venue..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {renderError(errors.description)}
                </p>
              )}
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600">
                Address *
              </label>
              <input
                {...register("address", { required: "Address is required" })}
                className="mt-1 w-full p-2 border-b-2 border-gray-200 focus:border-green-500 outline-none transition"
                placeholder="e.g., 123 Sports Street"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-600">
                  {renderError(errors.address)}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="flex items-center text-xl font-bold text-gray-800 mb-4">
              <Sparkles className="w-6 h-6 mr-3 text-green-600" />
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

        <div className="lg:sticky top-6 self-start space-y-6">
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
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 20 && (
                <label className="flex flex-col justify-center items-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-md text-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
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
                {renderError((errors.photos as any) ?? undefined)}
              </p>
            )}
          </div>
          <input type="hidden" {...register("slug")} />
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