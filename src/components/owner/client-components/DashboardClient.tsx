"use client";

import { Card, CardContent } from "@/components/ui/Card";
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
import { useTransition } from "react";
import { revalidateDashboard } from "@/app/(owner)/manager/_actions/dashboard.actions";
import { RefreshCw } from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// Define the props for the client component
interface DashboardClientProps {
  stats: {
    bookings: number;
    venues: number;
    earnings: number;
    reviews: number;
  };
  bookingStats: {
    indoor: { [key: string]: number };
    outdoor: { [key: string]: number };
  };
  monthlyEarnings: {
    labels: string[];
    data: number[];
  };
}

export default function DashboardClient({
  stats,
  bookingStats,
  monthlyEarnings,
}: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    // startTransition allows us to update the UI without blocking it,
    // showing a loading state while the server action runs.
    startTransition(() => {
      revalidateDashboard();
    });
  };

  // Theme colors
  const GREEN = "#22c55e";
  const BLUE = "#3b82f6";
  const YELLOW = "#facc15";
  const PURPLE = "#a855f7";
  const ORANGE = "#fb923c";
  const TEAL = "#14b8a6";
  const SOFT_BG = "#f9fafb";

  // Chart data transformations
  const outdoorData = {
    labels: Object.keys(bookingStats.outdoor),
    datasets: [
      {
        data: Object.values(bookingStats.outdoor),
        backgroundColor: [GREEN, BLUE, ORANGE, PURPLE],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const indoorData = {
    labels: Object.keys(bookingStats.indoor),
    datasets: [
      {
        data: Object.values(bookingStats.indoor),
        backgroundColor: [BLUE, GREEN, ORANGE, TEAL, YELLOW],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const earningsData = {
    labels: monthlyEarnings.labels,
    datasets: [
      {
        label: "Earnings",
        data: monthlyEarnings.data,
        backgroundColor: GREEN,
        borderRadius: 8,
      },
    ],
  };

  // Shared chart options
  const chartOptions = {
    maintainAspectRatio: false,
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
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Manager Dashboard
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <p className="text-gray-500 mb-8">Insights at a glance</p>

      {/* The rest of the dashboard UI remains the same */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

      <div>
        <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Earnings (Last 6 Months)
          </h2>
          <div className="h-64">
            <Bar
              data={earningsData}
              options={{
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
