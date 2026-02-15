import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "@/types";

interface AddressState {
  addresses: Address[];
  addAddress: (address: Omit<Address, "id">) => string;
  updateAddress: (id: string, data: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => Address | undefined;
}

let counter = 3;

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [
        {
          id: "addr-1",
          title: "Ev",
          address: "Bagdat Cad. No:123 D:5, Kadikoy",
          city: "Istanbul",
          district: "Kadikoy",
          lat: 40.9862,
          lng: 29.0558,
          isDefault: true,
        },
        {
          id: "addr-2",
          title: "Is",
          address: "Levent Mah. Buyukdere Cad. No:45, Besiktas",
          city: "Istanbul",
          district: "Besiktas",
          lat: 41.0822,
          lng: 29.0109,
          isDefault: false,
        },
      ],

      addAddress: (address) => {
        const id = `addr-${++counter}`;
        const newAddress: Address = { ...address, id };
        const addresses = get().addresses;
        if (newAddress.isDefault) {
          set({
            addresses: [
              ...addresses.map((a) => ({ ...a, isDefault: false })),
              newAddress,
            ],
          });
        } else {
          set({ addresses: [...addresses, newAddress] });
        }
        return id;
      },

      updateAddress: (id, data) => {
        set({
          addresses: get().addresses.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        });
      },

      removeAddress: (id) => {
        const addresses = get().addresses.filter((a) => a.id !== id);
        if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
          addresses[0].isDefault = true;
        }
        set({ addresses });
      },

      setDefault: (id) => {
        set({
          addresses: get().addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        });
      },

      getDefault: () => {
        return get().addresses.find((a) => a.isDefault) || get().addresses[0];
      },
    }),
    { name: "neyisek-addresses" }
  )
);
