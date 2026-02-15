import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  address: string | null;
  city: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  isLocating: boolean;
  setLocation: (location: {
    address: string;
    city: string;
    district: string;
    lat: number;
    lng: number;
  }) => void;
  setLocating: (isLocating: boolean) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      address: null,
      city: null,
      district: null,
      lat: null,
      lng: null,
      isLocating: false,

      setLocation: (location) =>
        set({ ...location, isLocating: false }),

      setLocating: (isLocating) => set({ isLocating }),

      clearLocation: () =>
        set({
          address: null,
          city: null,
          district: null,
          lat: null,
          lng: null,
        }),
    }),
    { name: "neyisek-location" }
  )
);
