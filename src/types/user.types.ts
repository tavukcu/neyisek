import { Timestamp } from "firebase/firestore";

export type UserRole = "customer" | "restaurant" | "courier" | "admin";

export interface Address {
  id: string;
  title: string;
  address: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface UserPreferences {
  language: "tr" | "en";
  darkMode: boolean;
  notifications: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string | null;
  photoURL: string | null;
  role: UserRole;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}
