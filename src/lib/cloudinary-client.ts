
export async function uploadImagesToCloudinary(files: File[]): Promise<string[]> {
  // 1. Read client-side env vars, which MUST have the NEXT_PUBLIC_ prefix.
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  // Make sure both variables are available.
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary configuration is missing. Check your .env.local file."
    );
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    // 2. THIS IS THE KEY CHANGE: Add the upload preset to the form data.
    // This tells Cloudinary which rules to apply to this unsigned upload.
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // Get more detailed error info from Cloudinary's response
      const errorData = await response.json();
      console.error("Cloudinary upload failed:", errorData);
      throw new Error(`Failed to upload image: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.secure_url; // Return the secure URL of the uploaded file
  });

  // Wait for all uploads to complete
  const uploadedUrls = await Promise.all(uploadPromises);
  return uploadedUrls;
}