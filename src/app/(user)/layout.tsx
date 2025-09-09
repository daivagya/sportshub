// src/app/(user)/layout.tsx
import  VenuesProvider  from "../context/VenuesContext";
import Navbar from "@/components/user/client-components/Navbar";
async function getVenues() {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/user/getVenues`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch venues");
  }

  return res.json(); // already returns only selected fields
}

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const venues = await getVenues();

  return (
    <VenuesProvider initialVenues={venues}>
      <Navbar />
      {children}
    </VenuesProvider>
  );
}
