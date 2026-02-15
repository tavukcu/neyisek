import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus, PaymentMethod } from "@/types";
import type { CourierStatus, VehicleType } from "@/types";

/* ── Courier Delivery ── */
export interface CourierDelivery {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { name: string; quantity: number }[];
  total: number;
  payment: { method: PaymentMethod; status: "pending" | "paid" };
  status: "waiting" | "picked_up" | "delivering" | "delivered";
  estimatedTime: number;
  distance: number;
  fee: number;
  createdAt: string;
  completedAt?: string;
}

/* ── Store State ── */
interface CourierPanelState {
  courierName: string;
  courierStatus: CourierStatus;
  vehicle: { type: VehicleType; plate: string };
  zone: { city: string; district: string };
  activeDeliveries: CourierDelivery[];
  completedDeliveries: CourierDelivery[];
  todayEarnings: number;
  todayDeliveries: number;
  totalEarnings: number;
  totalDeliveries: number;
  rating: number;

  setStatus: (status: CourierStatus) => void;
  acceptDelivery: (id: string) => void;
  updateDeliveryStatus: (id: string, status: CourierDelivery["status"]) => void;
  completeDelivery: (id: string) => void;
}

const now = new Date();
const h = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

export const useCourierPanelStore = create<CourierPanelState>()(
  persist(
    (set, get) => ({
      courierName: "Ali Yilmaz",
      courierStatus: "available" as CourierStatus,
      vehicle: { type: "motorcycle" as VehicleType, plate: "34 ABC 123" },
      zone: { city: "Istanbul", district: "Kadikoy" },

      activeDeliveries: [
        {
          id: "cd-1",
          orderNumber: "NY-2026-0850",
          restaurantName: "Burger King",
          restaurantAddress: "Bagdat Cad. No:123, Kadikoy",
          customerName: "Ahmet Y.",
          customerPhone: "0532 *** 45 67",
          customerAddress: "Bagdat Cad. No:123 D:5, Kadikoy",
          items: [{ name: "Whopper Menu", quantity: 2 }, { name: "Coca Cola", quantity: 2 }],
          total: 429.95,
          payment: { method: "credit_card", status: "paid" },
          status: "waiting",
          estimatedTime: 25,
          distance: 2.3,
          fee: 18.50,
          createdAt: h(10),
        },
        {
          id: "cd-2",
          orderNumber: "NY-2026-0849",
          restaurantName: "Pizza Lazza",
          restaurantAddress: "Istiklal Cad. No:45, Beyoglu",
          customerName: "Zeynep K.",
          customerPhone: "0544 *** 12 89",
          customerAddress: "Moda Cad. No:45, Kadikoy",
          items: [{ name: "Margarita Pizza", quantity: 1 }, { name: "Ayran", quantity: 2 }],
          total: 198.97,
          payment: { method: "cash", status: "pending" },
          status: "picked_up",
          estimatedTime: 15,
          distance: 1.8,
          fee: 15.00,
          createdAt: h(20),
        },
      ],

      completedDeliveries: [
        {
          id: "cd-3",
          orderNumber: "NY-2026-0845",
          restaurantName: "Kebapci Iskender",
          restaurantAddress: "Ataturk Cad. No:7, Kadikoy",
          customerName: "Elif S.",
          customerPhone: "0533 *** 34 56",
          customerAddress: "Fenerbahce Mah. No:8, Kadikoy",
          items: [{ name: "Iskender Kebap", quantity: 1 }],
          total: 349.99,
          payment: { method: "credit_card", status: "paid" },
          status: "delivered",
          estimatedTime: 20,
          distance: 3.1,
          fee: 22.00,
          createdAt: h(120),
          completedAt: h(95),
        },
        {
          id: "cd-4",
          orderNumber: "NY-2026-0840",
          restaurantName: "Pidecim",
          restaurantAddress: "Tunali Hilmi Cad. No:88, Kadikoy",
          customerName: "Can D.",
          customerPhone: "0542 *** 90 12",
          customerAddress: "Acibadem Mah. No:22, Kadikoy",
          items: [{ name: "Kusbasili Pide", quantity: 2 }],
          total: 259.98,
          payment: { method: "credit_card", status: "paid" },
          status: "delivered",
          estimatedTime: 18,
          distance: 2.5,
          fee: 17.50,
          createdAt: h(200),
          completedAt: h(175),
        },
        {
          id: "cd-5",
          orderNumber: "NY-2026-0835",
          restaurantName: "Burger King",
          restaurantAddress: "Bagdat Cad. No:123, Kadikoy",
          customerName: "Mert B.",
          customerPhone: "0555 *** 67 89",
          customerAddress: "Goztepe Mah. No:15, Kadikoy",
          items: [{ name: "Big King", quantity: 1 }, { name: "Patates", quantity: 1 }],
          total: 189.98,
          payment: { method: "cash", status: "paid" },
          status: "delivered",
          estimatedTime: 15,
          distance: 1.5,
          fee: 12.00,
          createdAt: h(300),
          completedAt: h(280),
        },
      ],

      todayEarnings: 85.00,
      todayDeliveries: 5,
      totalEarnings: 4250.00,
      totalDeliveries: 187,
      rating: 4.8,

      setStatus: (status) => set({ courierStatus: status }),

      acceptDelivery: (id) => {
        set({
          activeDeliveries: get().activeDeliveries.map((d) =>
            d.id === id ? { ...d, status: "picked_up" as const } : d
          ),
        });
      },

      updateDeliveryStatus: (id, status) => {
        set({
          activeDeliveries: get().activeDeliveries.map((d) =>
            d.id === id ? { ...d, status } : d
          ),
        });
      },

      completeDelivery: (id) => {
        const delivery = get().activeDeliveries.find((d) => d.id === id);
        if (!delivery) return;
        const completed = { ...delivery, status: "delivered" as const, completedAt: new Date().toISOString() };
        set({
          activeDeliveries: get().activeDeliveries.filter((d) => d.id !== id),
          completedDeliveries: [completed, ...get().completedDeliveries],
          todayEarnings: get().todayEarnings + delivery.fee,
          todayDeliveries: get().todayDeliveries + 1,
          totalEarnings: get().totalEarnings + delivery.fee,
          totalDeliveries: get().totalDeliveries + 1,
        });
      },
    }),
    { name: "neyisek-courier-panel" }
  )
);
