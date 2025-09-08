import React from "react";
import CourtsSection from "@/components/owner/server-components/Courts-section";

interface PageProps {
  params: {
    venue: string; // This is the slug
  };
}

export const dynamic = "force-dynamic";

const Page = async ({ params }: PageProps) => {
  const { venue } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Venue Details</h1>
      {/* This part is correctly passing the props object */}
      <CourtsSection venueSlug={venue} />
    </div>
  );
};

export default Page;
