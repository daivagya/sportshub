"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { uploadImagesToCloudinary } from "@/lib/cloudinary-client";

interface FileUploaderProps {
  onUploadComplete: (urls: string[]) => void; // array of uploaded URLs
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export default function FileUploader({
  onUploadComplete,
  accept = "image/png, image/jpeg",
  maxSizeMB = 5,
  label = "Upload Files",
}: FileUploaderProps) {
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup previews
  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of selectedFiles) {
      if (accept && !accept.split(",").includes(file.type)) {
        setError(`Only ${accept.replace(/,/g, ", ")} files are allowed.`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Each file must be less than ${maxSizeMB}MB.`);
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setFiles(validFiles);
    setFilePreviews(previews);
    if (validFiles.length > 0) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Batch upload all files
      const uploadedUrls = await uploadImagesToCloudinary(files);
      onUploadComplete(uploadedUrls);

      setFiles([]);
      setFilePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Files uploaded successfully!");
    } catch (err) {
      console.error(err);
      const errorMessage = "Upload failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        {label}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-2 items-center mb-2">
          {filePreviews.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Preview ${idx + 1}`}
              className="h-16 w-16 rounded-md object-cover ring-2 ring-green-300 shadow-sm"
            />
          ))}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept={accept}
            multiple
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition"
        >
          {isUploading ? "Uploading..." : `Upload (${files.length} files)`}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
}
