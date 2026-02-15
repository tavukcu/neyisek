import { Timestamp } from "firebase/firestore";

export type CourierStatus = "available" | "busy" | "offline";
export type VehicleType = "bicycle" | "motorcycle" | "car";

export interface CourierVehicle {
  type: VehicleType;
  plate?: string;
}

export interface CourierDocuments {
  identity: string;
  license?: string;
  insurance?: string;
}

export interface CourierStats {
  totalDeliveries: number;
  rating: number;
  earnings: number;
}

export interface CourierZone {
  city: string;
  district: string;
}

export interface Courier {
  id: string;
  userId: string;
  name: string;
  phone: string;
  photoURL?: string;
  vehicle: CourierVehicle;
  documents: CourierDocuments;
  status: CourierStatus;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: Timestamp;
  };
  stats: CourierStats;
  zone: CourierZone;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
