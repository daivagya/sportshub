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
