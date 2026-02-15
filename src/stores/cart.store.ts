import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  extras: { id: string; name: string; price: number }[];
  notes?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (item) => {
        const { items, restaurantId } = get();

        if (restaurantId && restaurantId !== item.restaurantId) {
          set({
            items: [item],
            restaurantId: item.restaurantId,
            restaurantName: null,
          });
          return;
        }

        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId
        );

        if (existingIndex >= 0) {
          const updated = [...items];
          updated[existingIndex].quantity += item.quantity;
          set({ items: updated });
        } else {
          set({
            items: [...items, item],
            restaurantId: item.restaurantId,
          });
        }
      },

      removeItem: (productId) => {
        const items = get().items.filter((i) => i.productId !== productId);
        set({
          items,
          restaurantId: items.length === 0 ? null : get().restaurantId,
          restaurantName: items.length === 0 ? null : get().restaurantName,
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const items = get().items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        );
        set({ items });
      },

      clearCart: () =>
        set({ items: [], restaurantId: null, restaurantName: null }),

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const extrasTotal = item.extras.reduce((sum, e) => sum + e.price, 0);
          return total + (item.price + extrasTotal) * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    { name: "neyisek-cart" }
  )
);
