import React from "react";
import Navbar from "@/components/owner/client-components/Navbar";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
const layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();
  if (user?.role !== "OWNER") redirect("/login");
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default layout;
