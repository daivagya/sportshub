// /lib/validationFrontend.ts
import { z } from "zod";

export const signUpSchema = z.object({
  role: z.enum(["USER", "OWNER"]),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  avatarUrl: z
    .string()
    .url("Invalid avatar URL")
    .optional()
    .or(z.literal("")), // allow empty string
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export const addVenueSchema = z.object({
  name: z.string().min(1, "Venue name is required."),
  // ADD THIS: The slug is now a required part of the form data
  slug: z.string().min(1, "Slug is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long."),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().optional(),
  country: z.string(),
  amenities: z.array(z.string()).optional(),
  photos: z
    .any()
    .refine((files) => files?.length >= 1, "Please upload at least one photo.")
    .refine(
      (files) => files?.length <= 20,
      "You can upload a maximum of 20 photos."
    )
    .refine(
      (files) => Array.from(files).every((file) => file instanceof File),
      "Invalid file format."
    ),
});
