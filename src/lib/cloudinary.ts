import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true, // Use HTTPS
});

export default cloudinary;


export async function uploadToCloudinary(file: File): Promise<UploadApiResponse> {
  // 1. Convert the File to a Buffer
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  // 2. Use a Promise to handle the upload stream
  return new Promise((resolve, reject) => {
    // 3. Create an upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        // Optional: specify a folder in Cloudinary
        folder: "venue_photos", 
        // Optional: you can add tags, transformations, etc.
      },
      (error, result) => {
        if (error) {
          // If there's an error, reject the promise
          return reject(error);
        }
        if (result) {
          // If successful, resolve the promise with the result
          resolve(result);
        }
      }
    );

    // 4. Pipe the buffer to the upload stream
    Readable.from(buffer).pipe(uploadStream);
  });
}
