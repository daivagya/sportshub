"use client";

import { useState } from "react";
import {
  CameraIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import DeleteCourtModal from "@/components/owner/client-components/DeleteCourtForm";
import FileUploader from "@/components/shared/FileUploader"; // Reusable uploader

export default function CourtDetailsPage({
  court,
  initialImages = [],
}: {
  court: any;
  initialImages?: string[];
}) {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [images, setImages] = useState(initialImages);
  console.log("-------------------------------------------- ");
  if (!court) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Loading Court Data...
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            If this message persists, the court may not exist.
          </p>
        </div>
      </div>
    );
  }

  const handleUploadComplete = (newImageUrl: string) => {
    setImages((prevImages) => [...prevImages, newImageUrl]);
    toast.success("Image uploaded successfully!");
  };

  const formatTime = (time: number) =>
    `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(
      time % 60
    ).padStart(2, "0")}`;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="md:flex md:justify-between md:items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {court.name}
                </h1>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-1">
                  {court.venueName}
                </p>
              </div>
              <div className="flex items-center mt-4 md:mt-0">
                <StarIcon className="w-6 h-6 text-yellow-500" />
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200 ml-2">
                  {court.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({court.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Details & Actions */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-5 bg-green-50 dark:bg-gray-700/50 rounded-lg border border-green-200 dark:border-gray-600">
                  <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                    Court Details
                  </h2>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold">Sport:</dt>
                      <dd className="text-gray-600 dark:text-gray-300">
                        {court.sport}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Type:</dt>
                      <dd className="text-gray-600 dark:text-gray-300">
                        {court.type}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Hours:</dt>
                      <dd className="text-gray-600 dark:text-gray-300">
                        {formatTime(court.openTime)} –{" "}
                        {formatTime(court.closeTime)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Base Price:</dt>
                      <dd className="text-gray-600 dark:text-gray-300">
                        {court.currency} {court.priceSlots[0]?.price || "N/A"} /
                        slot
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Slug:</dt>
                      <dd>
                        <code className="text-xs bg-gray-200 dark:bg-gray-600 p-1 rounded">
                          {court.slug}
                        </code>
                      </dd>
                    </div>
                  </dl>
                </div>

                <a
                  href={`/reviews/court/${court.slug}`}
                  className="block text-center w-full py-2 px-4 rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/80 font-semibold transition"
                >
                  See All Reviews
                </a>

                <div className="pt-4 border-t dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Manager Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => toast("Update logic not implemented yet.")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition"
                    >
                      <PencilIcon className="w-5 h-5" /> Update Details
                    </button>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition"
                    >
                      <TrashIcon className="w-5 h-5" /> Delete Court
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Image Gallery & Upload */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CameraIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />{" "}
                  Image Gallery
                </h2>

                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                      >
                        <img
                          src={img}
                          alt={`Court image ${index + 1}`}
                          className="object-cover aspect-video w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      No images uploaded yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Add photos to attract more players.
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  <FileUploader
                    label="Upload Court Image"
                    onUploadComplete={handleUploadComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DeleteCourtModal
        court={court}
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
