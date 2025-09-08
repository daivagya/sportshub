import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      image?: string;
      isVerified: boolean;
    };
  }

  interface User {
    role: UserRole;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    isVerified: boolean;
  }
}

//VENUE
export type Venue = {
  name: string;
  slug: string;
  description?: string | null;
  city: string;
  state?: string | null;
  country?: string | null;
  address: string;
  amenities: string[]; // array of amenities
  photos: string[]; // array of photo URLs
};

//COURT

export type Court = {
  id: number;
  name: string;
  sport: string;
  type: string;
  currency: string;
  openTime: number;
  closeTime: number;
  priceSlots: PriceSlot[];
  slug: string;
  // Data added during processing
  venueName: string;

  // Aggregated review data
  reviewCount: number;
  averageRating: number;
};

export type PriceSlotInput = {
  startTime: number;
  price: string;
};

export type AddCourtInput = {
  venueSlug: string;
  name: string;
  sport: string;
  type: string;
  priceSlots: PriceSlotInput[]; // Plural name to match the data
  currency: string;
  openTime: number;
  closeTime: number;
  slug: string;
};

export {};
