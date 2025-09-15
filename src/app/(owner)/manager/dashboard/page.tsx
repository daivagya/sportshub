// src/app/(owner)/manager/dashboard/page.tsx
import { getDashboardData } from "@/app/(owner)/manager/_actions/dashboard.actions";
import DashboardClient from "@/components/owner/client-components/DashboardClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export default async function ManagerDashboard() {
  let dashboardData;
  try {
    // Fetch all dashboard data with a single, optimized action
    dashboardData = await getDashboardData();
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    dashboardData = {
      stats: { bookings: 0, venues: 0, earnings: 0, reviews: 0 },
      bookingStats: { indoor: {}, outdoor: {} },
      monthlyEarnings: { labels: [], data: [] },
    };
  }

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient
        stats={dashboardData.stats}
        bookingStats={dashboardData.bookingStats}
        monthlyEarnings={dashboardData.monthlyEarnings}
      />
    </Suspense>
  );
}

// A simple loading skeleton
function DashboardLoading() {
  return (
    <div
      className="p-6 min-h-screen animate-pulse"
      style={{ background: "#f9fafb" }}
    >
      <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-md w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="h-80 bg-gray-200 rounded-2xl"></div>
        <div className="h-80 bg-gray-200 rounded-2xl"></div>
      </div>
      <div className="h-80 bg-gray-200 rounded-2xl"></div>
    </div>
  );
}
