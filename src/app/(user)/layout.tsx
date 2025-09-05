import React from "react";
import Navbar from "@/components/user/Navbar";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      <Navbar />
      {children}
    </div>
  );
};

export default layout;
