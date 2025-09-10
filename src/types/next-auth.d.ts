import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

const venueDetailsSelector = {
  name: true,
  slug: true,
  description: true,
  address: true,
  city: true,
  state: true,
  country: true,
  amenities: true,
  photos: true, // Get all photos for the gallery
  courts: {
    select: {
      id: true,
      name: true,
      slug: true,
      sport: true,
      imageUrl: true,
      priceSlots: {
        orderBy: { pricePerHour: "asc" },
        take: 1,
        select: { pricePerHour: true },
      },
    },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5, // Get the 5 most recent reviews
  },
} satisfies Prisma.VenueSelect;

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

export type Venue = {
  slug: string; 
  name: string;
  description?: string | null;
  city: string;
  address: string;
  state?: string | null;
  country?: string | null;
  courts?: Court[];
  // Venue Features
  amenities: string[]; 
  photos: string[]; // Array of image URLs
  sport: string;
  price?: number;
  venueType?: "Indoor" | "Outdoor";
  averageRating?: number;
};

export type VenueDetails = {
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  amenities: string[];
  photos: string[];
  averageRating: number;
  reviews: {
    id: number;
    rating: number;
    comment: string;
    createdAt: Date;
    userName: string | null;
  }[];
  courts: {
    id: number;
    name: string;
    slug: string;
    sport: string;
    image: string;
    price: number | null;
  }[];
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
  venueName: string;
  imageUrl: string;
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

export type VenueFilters = {
  q?: string;
  sport?: string;
  price?: number;
  venueType?: "All" | "Indoor" | "Outdoor"; // <- enum-like
  rating?: number;
  city?: string;
  page?: number;
  limit?: number;
};

export type GetVenuesResult = {
  venues: Venue[];
  totalPages: number;
  currentPage: number;
};



export {};
