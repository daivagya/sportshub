"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { signUpSchema } from "@/lib/validationFrontend";
import toast from "react-hot-toast";
type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignUpForm & { avatarUrl?: string }>({
    role: "USER",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Avatar Upload ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log("Uploading avatar...", formData);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();

      console.log("Uploaded avatar URL:", url);
      setAvatarPreview(url); // preview in UI
      toast.success("Avatar updated!");
    } catch (err) {
      console.error("Error uploading avatar", err);
      toast.error("Failed to update avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0)
          fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        avatarUrl: avatarPreview,
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      router.push(`/verifyOtp?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-8 bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Create Your Account
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-2 border-green-500 overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatarPreview || form.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview || form.avatarUrl!}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Photo</span>
                )}
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs rounded-full">
                  Uploading…
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <label
                htmlFor="avatar"
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition cursor-pointer"
              >
                {form.avatarUrl || avatarPreview ? "Change" : "Upload"}
              </label>
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              {(form.avatarUrl || avatarPreview) && !avatarUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview(null);
                    setForm((p) => ({ ...p, avatarUrl: "" }));
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100"
                >
                  Remove
                </button>
              )}
            </div>
            {errors.avatar && (
              <p className="text-red-500 text-xs">{errors.avatar}</p>
            )}
          </div>

          {/* Role */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          >
            <option value="USER">Player</option>
            <option value="OWNER">Facility Owner</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}

          {/* Full Name */}
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs">{errors.fullName}</p>
          )}

          {/* Email */}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email}</p>
          )}

          {/* Password */}
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password}</p>
          )}

          {/* Confirm Password */}
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
          )}

          {/* General Error */}
          {errors.general && (
            <p className="text-red-500 text-center text-sm">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={loading || avatarUploading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Signing Up…" : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-green-600 font-semibold hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </form>
      </div>

      {/* Right: Illustration */}
      <div className="hidden md:flex w-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/sports-tools.jpg"
          alt="Sports"
          className="w-full h-full object-cover rounded-l-2xl"
        />
      </div>
    </div>
  );
}
