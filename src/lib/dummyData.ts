// lib/dummyData.ts
// Dummy data shaped like your Prisma models (no Prisma imports needed)

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type Court = {
  id: number;
  venueId: number;
  name: string;
  sport: string;
  pricePerHour: number; // paisa
  currency: string;
  openTime: number; // 0-23
  closeTime: number; // 0-23
};

export type Venue = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  city: string;
  state?: string | null;
  country?: string | null;
  amenities: string[];
  photos: string[];
  approved: boolean;
  rating?: number | null;
  courts: Court[];
  venueType?: "Indoor" | "Outdoor"; // added for frontend filtering
};

export type Booking = {
  id: number;
  userId: number;
  courtId: number;
  startTime: string; // ISO
  endTime: string; // ISO
  status: BookingStatus;
};

// ---- courts
export const courts: Court[] = [
  { id: 1, venueId: 1, name: "Court A", sport: "Badminton", pricePerHour: 50000, currency: "INR", openTime: 6, closeTime: 22 },
  { id: 2, venueId: 1, name: "Court B", sport: "Badminton", pricePerHour: 45000, currency: "INR", openTime: 6, closeTime: 22 },
  { id: 3, venueId: 2, name: "Turf 1", sport: "Football", pricePerHour: 200000, currency: "INR", openTime: 5, closeTime: 23 },
  { id: 4, venueId: 3, name: "Table 1", sport: "Table Tennis", pricePerHour: 30000, currency: "INR", openTime: 7, closeTime: 21 },
  { id: 5, venueId: 4, name: "Court C", sport: "Tennis", pricePerHour: 120000, currency: "INR", openTime: 6, closeTime: 22 },
];

// ---- venues
export const venues: Venue[] = [
  {
    id: 1,
    name: "SBR Badminton Arena",
    slug: "sbr-badminton",
    description: "Premium indoor badminton courts with wooden flooring.",
    address: "Vastrapur, Ahmedabad",
    city: "Ahmedabad",
    amenities: ["Parking", "Cafeteria", "Lights"],
    photos: ["/images/venue1.jpg"],
    approved: true,
    rating: 4.6,
    courts: courts.filter((c) => c.venueId === 1),
    venueType: "Indoor",
  },
  {
    id: 2,
    name: "XYZ Football Turf",
    slug: "xyz-football-turf",
    description: "State-of-the-art football ground with night lights.",
    address: "Satellite, Ahmedabad",
    city: "Ahmedabad",
    amenities: ["Shower", "Parking", "Drinking Water"],
    photos: ["/images/venue2.jpg"],
    approved: true,
    rating: 4.3,
    courts: courts.filter((c) => c.venueId === 2),
    venueType: "Outdoor",
  },
  {
    id: 3,
    name: "Spin City TT Club",
    slug: "spin-city-tt",
    description: "International tables with anti-glare lighting.",
    address: "Navrangpura, Ahmedabad",
    city: "Ahmedabad",
    amenities: ["AC Hall", "Coach", "Locker"],
    photos: ["/images/venue3.jpg"],
    approved: true,
    rating: 4.4,
    courts: courts.filter((c) => c.venueId === 3),
    venueType: "Indoor",
  },
  {
    id: 4,
    name: "Green Court Tennis",
    slug: "green-court-tennis",
    description: "Cushioned acrylic surface & pro lighting.",
    address: "Bopal, Ahmedabad",
    city: "Ahmedabad",
    amenities: ["Parking", "Lights", "Cafeteria"],
    photos: ["/images/venue4.jpg"],
    approved: true,
    rating: 4.5,
    courts: courts.filter((c) => c.venueId === 4),
    venueType: "Outdoor",
  },
];

// ---- bookings (for availability badges later if needed)
export const bookings: Booking[] = [
  {
    id: 1,
    userId: 1,
    courtId: 1,
    startTime: new Date().toISOString(), // ongoing dummy booking
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
  },
  {
    id: 2,
    userId: 2,
    courtId: 3,
    startTime: "2025-09-05T18:00:00.000Z",
    endTime: "2025-09-05T19:30:00.000Z",
    status: "PENDING",
  },
];

// ---- popular sports (overlay cards)
export const popularSports = [
  { name: "Badminton", image: "/images/badminton.jpg" },
  { name: "Football", image: "/images/football.jpg" },
  { name: "Cricket", image: "/images/cricket.jpg" },
  { name: "Swimming", image: "/images/swimming.jpg" },
  { name: "Tennis", image: "/images/tennis.jpg" },
  { name: "Table Tennis", image: "/images/tabletennis.jpg" },
];

// ---- sports we offer (icons / grid)
export const sports = [
  { id: 1, name: "Badminton", icon: "/icons/badminton.svg" },
  { id: 2, name: "Football", icon: "/icons/football.svg" },
  { id: 3, name: "Cricket", icon: "/icons/cricket.svg" },
  { id: 4, name: "Tennis", icon: "/icons/tennis.svg" },
  { id: 5, name: "Table Tennis", icon: "/icons/tabletennis.svg" },
  { id: 6, name: "Swimming", icon: "/icons/swimming.svg" },
  { id: 7, name: "Basketball", icon: "/icons/basketball.svg" },
  { id: 8, name: "Volleyball", icon: "/icons/volleyball.svg" },
];