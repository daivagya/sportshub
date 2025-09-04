import React from "react";
import Navbar from "@/components/owner/Navbar";
import { AuthProvider } from "@/app/context/AuthenticationProvider";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <AuthProvider>
        <Navbar />
        {children}
      </AuthProvider>
    </div>
  );
};

export default layout;
