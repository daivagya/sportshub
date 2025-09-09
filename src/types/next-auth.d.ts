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

export interface Venue {
  // `id` is intentionally omitted for client-side security and data minimization.
  slug: string; // Used for URLs and as the unique key in React lists.
  name: string;
  description?: string | null;
  
  // Location Details
  city: string;
  address: string;
  state?: string | null;
  country?: string | null;

  // Venue Features
  amenities: string[]; // e.g., ["Parking", "Restrooms", "Drinking Water"]
  photos: string[];    // Array of image URLs

  // --- Fields for Filtering & Display ---
  sport: string;
  price?: number;
  venueType?: "Indoor" | "Outdoor";

  // This will be calculated on the server from the VenueReview model
  // before being sent to the client.
  averageRating?: number; 
}


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
  imageUrl: string;
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
  imageUrl: string;
};


export interface UpdateCourtByIdInput {
  id: number;
  name?: string;
  slug?: string;
  sport?: string;
  type?: string;
  openTime?: number;
  closeTime?: number;
  currency?: string;
  imageUrl?: string;
  priceSlots?: { startTime: number; price: string }[];
}

export {};
