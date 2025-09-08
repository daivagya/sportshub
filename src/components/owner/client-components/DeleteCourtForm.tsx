"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";

// Mock API – replace with your real API call
async function deleteCourtBySlug(slug: string, pathname: string) {
  return new Promise<{ success: boolean; error?: string }>((resolve) =>
    setTimeout(() => {
      if (Math.random() > 0.2) resolve({ success: true });
      else resolve({ success: false, error: "Server error" });
    }, 1200)
  );
}

interface DeleteCourtModalProps {
  court: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteCourtModal({
  court,
  isOpen,
  onClose,
}: DeleteCourtModalProps) {
  const [isDeleting, startTransition] = useTransition();

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const router = {
    push: (path: string) => {
      if (typeof window !== "undefined") {
        window.location.href = path;
      }
    },
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCourtBySlug(court.slug, pathname);
      if (result.success) {
        toast.success(`Court "${court.name}" deleted successfully.`);
        onClose();
        router.push(pathname.substring(0, pathname.lastIndexOf("/")));
      } else {
        toast.error(result.error || "Failed to delete court.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <TrashIcon className="text-red-600 dark:text-red-500 w-6 h-6" />
          <h3 className="text-xl font-bold text-red-600 dark:text-red-500">
            Confirm Deletion
          </h3>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Are you sure you want to delete the court{" "}
          <strong className="font-semibold">{court.name}</strong>? This action
          <span className="font-semibold text-red-600"> cannot be undone.</span>
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
