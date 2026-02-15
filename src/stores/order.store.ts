import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus, PaymentMethod } from "@/types";

export interface LocalOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    extras: { name: string; price: number }[];
  }[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    total: number;
  };
  payment: {
    method: PaymentMethod;
    status: "pending" | "paid" | "failed";
  };
  delivery: {
    address: string;
    estimatedTime: number;
  };
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  createdAt: string;
}

interface OrderState {
  orders: LocalOrder[];
  createOrder: (order: Omit<LocalOrder, "id" | "orderNumber" | "createdAt" | "statusHistory">) => LocalOrder;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => void;
  getOrder: (id: string) => LocalOrder | undefined;
}

let orderCounter = 842;

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [
        {
          id: "order-1",
          orderNumber: "NY-2026-0841",
          restaurantId: "1",
          restaurantName: "Burger King",
          items: [
            { name: "Whopper Menu", price: 159.99, quantity: 1, extras: [{ name: "Extra Peynir", price: 15 }] },
            { name: "Coca Cola", price: 24.99, quantity: 2, extras: [] },
          ],
          pricing: { subtotal: 209.97, deliveryFee: 9.99, serviceFee: 10.50, discount: 0, total: 230.46 },
          payment: { method: "credit_card", status: "paid" },
          delivery: { address: "Bagdat Cad. No:123 D:5, Kadikoy", estimatedTime: 30 },
          status: "delivered",
          statusHistory: [
            { status: "pending", timestamp: "2026-02-15T10:00:00Z" },
            { status: "confirmed", timestamp: "2026-02-15T10:02:00Z" },
            { status: "preparing", timestamp: "2026-02-15T10:05:00Z" },
            { status: "ready", timestamp: "2026-02-15T10:20:00Z" },
            { status: "courier_assigned", timestamp: "2026-02-15T10:21:00Z" },
            { status: "picked_up", timestamp: "2026-02-15T10:23:00Z" },
            { status: "delivering", timestamp: "2026-02-15T10:23:00Z" },
            { status: "delivered", timestamp: "2026-02-15T10:30:00Z", note: "Teslim edildi" },
          ],
          createdAt: "2026-02-15T10:00:00Z",
        },
        {
          id: "order-2",
          orderNumber: "NY-2026-0840",
          restaurantId: "3",
          restaurantName: "Kebapci Iskender",
          items: [
            { name: "Iskender Kebap (1.5 Porsiyon)", price: 349.99, quantity: 1, extras: [{ name: "Extra Yogurt", price: 25 }] },
            { name: "Ayran", price: 19.99, quantity: 2, extras: [] },
          ],
          pricing: { subtotal: 414.97, deliveryFee: 0, serviceFee: 20.75, discount: 0, total: 435.72 },
          payment: { method: "cash", status: "paid" },
          delivery: { address: "Bagdat Cad. No:123 D:5, Kadikoy", estimatedTime: 25 },
          status: "delivered",
          statusHistory: [
            { status: "pending", timestamp: "2026-02-14T19:00:00Z" },
            { status: "confirmed", timestamp: "2026-02-14T19:01:00Z" },
            { status: "preparing", timestamp: "2026-02-14T19:03:00Z" },
            { status: "delivered", timestamp: "2026-02-14T19:28:00Z" },
          ],
          createdAt: "2026-02-14T19:00:00Z",
        },
      ],

      createOrder: (orderData) => {
        const id = `order-${Date.now()}`;
        const orderNumber = `NY-2026-${String(++orderCounter).padStart(4, "0")}`;
        const now = new Date().toISOString();
        const order: LocalOrder = {
          ...orderData,
          id,
          orderNumber,
          createdAt: now,
          statusHistory: [{ status: orderData.status, timestamp: now }],
        };
        set({ orders: [order, ...get().orders] });
        return order;
      },

      updateOrderStatus: (id, status, note) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  statusHistory: [
                    ...o.statusHistory,
                    { status, timestamp: new Date().toISOString(), note },
                  ],
                }
              : o
          ),
        });
      },

      getOrder: (id) => {
        return get().orders.find((o) => o.id === id);
      },
    }),
    { name: "neyisek-orders" }
  )
);
