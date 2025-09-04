"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function ManagerDashboard() {
  const [stats] = useState({
    bookings: 120,
    venues: 8,
    earnings: 56000,
    reviews: 42,
  });

  // 🎨 Strong theme colors
  const GREEN = "#22c55e";
  const BLUE = "#3b82f6";
  const YELLOW = "#facc15";
  const PURPLE = "#a855f7";
  const ORANGE = "#fb923c";
  const TEAL = "#14b8a6";

  const SOFT_BG = "#f9fafb"; // Tailwind gray-50

  // ✅ Outdoor bookings (Badminton removed)
  const outdoorData = {
    labels: ["Cricket (Turf)", "Football (Turf)", "Basketball", "Tennis"],
    datasets: [
      {
        data: [40, 30, 15, 15],
        backgroundColor: [GREEN, BLUE, ORANGE, PURPLE],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // ✅ Indoor bookings (with Badminton added)
  const indoorData = {
    labels: ["Pool", "Table Tennis", "Carrom", "Console Games", "Badminton"],
    datasets: [
      {
        data: [20, 25, 15, 20, 20],
        backgroundColor: [BLUE, GREEN, ORANGE, TEAL, YELLOW],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // ✅ Earnings bar chart
  const earningsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Earnings",
        data: [5000, 8000, 6500, 7200, 9000, 11000],
        backgroundColor: GREEN,
        borderRadius: 8,
      },
    ],
  };

  // Shared chart options for smooth UX
  const chartOptions = {
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#64748b",
          boxWidth: 14,
          font: { size: 13 },
          padding: 10,
        },
      },
    },
  };

  return (
    <div className="p-6 min-h-screen" style={{ background: SOFT_BG }}>
      {/* Header */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
        Manager Dashboard
      </h1>
      <p className="text-gray-500 mb-8">Insights at a glance</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Bookings"
          value={stats.bookings}
          color={GREEN}
        />
        <DashboardCard
          title="Venues Listed"
          value={stats.venues}
          color={BLUE}
        />
        <DashboardCard
          title="Total Earnings"
          value={`₹${stats.earnings.toLocaleString()}`}
          color={ORANGE}
        />
        <DashboardCard title="Reviews" value={stats.reviews} color={PURPLE} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Outdoor Bookings */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Outdoor Bookings
          </h2>
          <div className="h-64">
            <Doughnut
              data={outdoorData}
              options={{ ...chartOptions, cutout: "70%" }}
            />
          </div>
        </Card>

        {/* Indoor Bookings */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Indoor Bookings
          </h2>
          <div className="h-64">
            <Doughnut
              data={indoorData}
              options={{ ...chartOptions, cutout: "70%" }}
            />
          </div>
        </Card>
      </div>

      {/* Earnings */}
      <div className="grid grid-cols-1">
        <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Earnings (Last 6 Months)
          </h2>
          <div className="h-64">
            <Bar
              data={earningsData}
              options={{
                animation: false,
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#64748b" },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f1f5f9" },
                    ticks: { color: "#64748b" },
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// 🎨 Stat Card
function DashboardCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="rounded-xl border border-gray-100 shadow-sm bg-white transition hover:-translate-y-1 hover:shadow-md">
      <CardContent className="flex flex-col items-center py-6">
        <p className="text-sm text-gray-500 mb-2">{title}</p>
        <h3 className="text-3xl font-bold" style={{ color }}>
          {value}
        </h3>
        <div
          className="w-10 h-1 rounded-full mt-3"
          style={{ backgroundColor: color, opacity: 0.18 }}
        />
      </CardContent>
    </Card>
  );
}
