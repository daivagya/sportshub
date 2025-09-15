// types/booking.ts
export type SlotStatus = "AVAILABLE" | "PENDING" | "BOOKED";

export interface DaySlot {
  date: string; // YYYY-MM-DD
  slots: {
    hour: number; // e.g., 9 for 09:00-10:00
    pricePerHour: number;
    status: SlotStatus;
  }[];
}

export interface GetSlotsResult {
  courtId: number;
  courtSlug: string;
  days: DaySlot[]; // next 7 days
}

// Booking creation input (client -> server)
export interface CreateBookingInput {
  courtSlug: string;
  date: string; // YYYY-MM-DD (local date chosen by user)
  hour: number; // e.g., 9
  // idempotency key to prevent duplicate POSTs
  idempotencyKey?: string;
  notes?: string;
  // DO NOT accept userId from client — server should derive from session.
}
export interface CreateBookingResult {
  success: boolean;
  booking?: unknown; // Prisma Booking
  error?: string;
}

export type UserBooking = {
  id: number;
  court: { name: string };
  venue: { name: string };
  sport: string;
  startTime: Date;
  endTime: Date;
  amount: number;
  currency: string;
  status: string;
};
