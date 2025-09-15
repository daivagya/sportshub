"use client";

import { useState } from "react";
import DeleteCourtModal from "./DeleteCourtForm";
import UpdateCourtModal from "./UpdateCourtForm";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
// import { Court } from "@/types/next-auth";

export function CourtDetailsPage({ court }: any) {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);

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

  console.log("((((((((--->from court details page", court);
  const formatTime = (minutes: number) => {
    if (isNaN(minutes)) return "N/A";
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hours}:${mins}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {court.name}
              </h1>
              <p className="text-md text-gray-500 dark:text-gray-400 mt-1">
                {court.venue?.name || "Venue"}
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-green-50 dark:bg-gray-700/50 rounded-lg border border-green-200 dark:border-gray-600">
                {court.imageUrl && (
                  <div className="max-w-md mx-auto mb-6 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={court.imageUrl}
                      alt={`Image of ${court.name}`}
                      className="object-cover w-full aspect-video"
                    />
                  </div>
                )}

                <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4">
                  Court Details
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-semibold text-gray-800 dark:text-gray-100">
                      Sport:
                    </dt>
                    <dd className="text-gray-600 dark:text-gray-300">
                      {court.sport}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-800 dark:text-gray-100">
                      Type:
                    </dt>
                    <dd className="text-gray-600 dark:text-gray-300">
                      {court.type}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-800 dark:text-gray-100">
                      Operating Hours:
                    </dt>
                    <dd className="text-gray-600 dark:text-gray-300">
                      {formatTime(court.openTime)} –{" "}
                      {formatTime(court.closeTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-800 dark:text-gray-100">
                      Base Price:
                    </dt>
                    <dd className="text-gray-600 dark:text-gray-300">
                      {court.currency || "INR"}{" "}
                      {court.priceSlots?.[0]?.price || "N/A"} / hour
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">
                  Manager Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setUpdateModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition"
                  >
                    <PencilIcon className="w-5 h-5" /> Update Details
                  </button>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition"
                  >
                    <TrashIcon className="w-5 h-5" /> Delete Court
                  </button>
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

      <UpdateCourtModal
        court={court}
        isOpen={isUpdateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
      />
    </div>
  );
}
