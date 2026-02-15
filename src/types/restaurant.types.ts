import { Timestamp } from "firebase/firestore";

export type RestaurantStatus = "pending" | "active" | "suspended" | "closed";

export interface RestaurantAddress {
  full: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
}

export interface RestaurantContact {
  phone: string;
  email: string;
  website?: string;
}

export interface RestaurantImages {
  logo: string;
  cover: string;
  gallery: string[];
}

export interface WorkingHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface DeliverySettings {
  fee: number;
  minOrder: number;
  estimatedTime: number;
  radius: number;
}

export interface Rating {
  average: number;
  count: number;
}

export interface Commission {
  rate: number;
  type: "percentage" | "fixed";
}

export interface RestaurantFeatures {
  hasPickup: boolean;
  hasDelivery: boolean;
  acceptsCard: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  address: RestaurantAddress;
  contact: RestaurantContact;
  cuisine: string[];
  images: RestaurantImages;
  hours: Record<string, WorkingHours>;
  delivery: DeliverySettings;
  rating: Rating;
  commission: Commission;
  status: RestaurantStatus;
  features: RestaurantFeatures;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
