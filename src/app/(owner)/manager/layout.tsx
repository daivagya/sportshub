import React from "react";
import Navbar from "@/components/owner/client-components/Navbar";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
const layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();
  if (user?.role !== "OWNER") redirect("/login");

  return (
    <div>
      {/* Pass the user object to the Navbar */}
      <Navbar user={user} />
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default layout;
