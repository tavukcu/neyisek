import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus, PaymentMethod } from "@/types";

/* ── Restaurant Order (panel-side) ── */
export interface PanelOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; price: number; quantity: number; extras: { name: string; price: number }[] }[];
  pricing: { subtotal: number; deliveryFee: number; serviceFee: number; discount: number; total: number };
  payment: { method: PaymentMethod; status: "pending" | "paid" | "failed" };
  delivery: { address: string; estimatedTime: number };
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  createdAt: string;
}

/* ── Panel Product ── */
export interface PanelProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  extras: { id: string; name: string; price: number }[];
  variants: { id: string; name: string; price: number }[];
  isActive: boolean;
  isPopular: boolean;
  stock: number;
  preparationTime: number;
}

/* ── Panel Review ── */
export interface PanelReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  reply?: string;
  orderId: string;
  createdAt: string;
}

/* ── Panel Category ── */
export interface PanelCategory {
  id: string;
  name: string;
  order: number;
}

/* ── Store State ── */
interface RestaurantPanelState {
  restaurantName: string;
  orders: PanelOrder[];
  products: PanelProduct[];
  categories: PanelCategory[];
  reviews: PanelReview[];

  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addProduct: (product: Omit<PanelProduct, "id">) => void;
  updateProduct: (id: string, data: Partial<PanelProduct>) => void;
  removeProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  replyReview: (id: string, reply: string) => void;
}

const now = new Date();
const h = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

export const useRestaurantPanelStore = create<RestaurantPanelState>()(
  persist(
    (set, get) => ({
      restaurantName: "Burger King",

      /* ── Mock Orders ── */
      orders: [
        {
          id: "po-1",
          orderNumber: "NY-2026-0850",
          customerName: "Ahmet Y.",
          customerPhone: "0532 *** 45 67",
          items: [
            { name: "Whopper Menu", price: 159.99, quantity: 2, extras: [{ name: "Extra Peynir", price: 15 }] },
            { name: "Coca Cola", price: 24.99, quantity: 2, extras: [] },
          ],
          pricing: { subtotal: 399.96, deliveryFee: 9.99, serviceFee: 20.0, discount: 0, total: 429.95 },
          payment: { method: "credit_card", status: "paid" },
          delivery: { address: "Bagdat Cad. No:123 D:5, Kadikoy", estimatedTime: 30 },
          status: "preparing",
          statusHistory: [
            { status: "pending", timestamp: h(15) },
            { status: "confirmed", timestamp: h(13) },
            { status: "preparing", timestamp: h(10) },
          ],
          createdAt: h(15),
        },
        {
          id: "po-2",
          orderNumber: "NY-2026-0849",
          customerName: "Zeynep K.",
          customerPhone: "0544 *** 12 89",
          items: [
            { name: "Big King", price: 139.99, quantity: 1, extras: [] },
            { name: "Patates Kizartmasi", price: 39.99, quantity: 1, extras: [] },
          ],
          pricing: { subtotal: 179.98, deliveryFee: 9.99, serviceFee: 9.0, discount: 0, total: 198.97 },
          payment: { method: "cash", status: "pending" },
          delivery: { address: "Moda Cad. No:45, Kadikoy", estimatedTime: 25 },
          status: "confirmed",
          statusHistory: [
            { status: "pending", timestamp: h(8) },
            { status: "confirmed", timestamp: h(6) },
          ],
          createdAt: h(8),
        },
        {
          id: "po-3",
          orderNumber: "NY-2026-0848",
          customerName: "Mehmet A.",
          customerPhone: "0555 *** 78 90",
          items: [
            { name: "Chicken Royale", price: 109.99, quantity: 3, extras: [{ name: "Aci Sos", price: 5 }] },
          ],
          pricing: { subtotal: 344.97, deliveryFee: 9.99, serviceFee: 17.25, discount: 0, total: 372.21 },
          payment: { method: "credit_card", status: "paid" },
          delivery: { address: "Caferaga Mah. No:12, Kadikoy", estimatedTime: 20 },
          status: "pending",
          statusHistory: [{ status: "pending", timestamp: h(2) }],
          createdAt: h(2),
        },
        {
          id: "po-4",
          orderNumber: "NY-2026-0845",
          customerName: "Elif S.",
          customerPhone: "0533 *** 34 56",
          items: [
            { name: "Whopper", price: 129.99, quantity: 1, extras: [] },
            { name: "Sogan Halkasi", price: 44.99, quantity: 1, extras: [] },
            { name: "Coca Cola", price: 24.99, quantity: 1, extras: [] },
          ],
          pricing: { subtotal: 199.97, deliveryFee: 9.99, serviceFee: 10.0, discount: 0, total: 219.96 },
          payment: { method: "credit_card", status: "paid" },
          delivery: { address: "Fenerbahce Mah. No:8, Kadikoy", estimatedTime: 30 },
          status: "delivered",
          statusHistory: [
            { status: "pending", timestamp: h(120) },
            { status: "confirmed", timestamp: h(118) },
            { status: "preparing", timestamp: h(115) },
            { status: "ready", timestamp: h(100) },
            { status: "delivered", timestamp: h(90), note: "Teslim edildi" },
          ],
          createdAt: h(120),
        },
        {
          id: "po-5",
          orderNumber: "NY-2026-0842",
          customerName: "Can D.",
          customerPhone: "0542 *** 90 12",
          items: [
            { name: "Big King", price: 139.99, quantity: 2, extras: [{ name: "Extra Peynir", price: 15 }] },
          ],
          pricing: { subtotal: 309.98, deliveryFee: 9.99, serviceFee: 15.5, discount: 0, total: 335.47 },
          payment: { method: "credit_card", status: "paid" },
          delivery: { address: "Acıbadem Mah. No:22, Kadikoy", estimatedTime: 35 },
          status: "delivered",
          statusHistory: [
            { status: "pending", timestamp: h(180) },
            { status: "confirmed", timestamp: h(178) },
            { status: "preparing", timestamp: h(175) },
            { status: "delivered", timestamp: h(155) },
          ],
          createdAt: h(180),
        },
      ],

      /* ── Mock Products ── */
      products: [
        { id: "pp-1", name: "Whopper", description: "Ateste izgara 113g sigir eti, domates, marul, tursu, sogan", price: 129.99, categoryId: "burger", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop", extras: [{ id: "e1", name: "Extra Peynir", price: 15 }, { id: "e2", name: "Bacon", price: 20 }], variants: [{ id: "v1", name: "Menu", price: 159.99 }, { id: "v2", name: "King Boy Menu", price: 179.99 }], isActive: true, isPopular: true, stock: 100, preparationTime: 10 },
        { id: "pp-2", name: "Big King", description: "Iki kat sigir eti, ozel sos, marul, peynir", price: 139.99, categoryId: "burger", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=400&fit=crop", extras: [{ id: "e1", name: "Extra Peynir", price: 15 }], variants: [{ id: "v1", name: "Menu", price: 169.99 }], isActive: true, isPopular: true, stock: 100, preparationTime: 10 },
        { id: "pp-3", name: "Chicken Royale", description: "Citir tavuk fileto, mayonez, marul", price: 109.99, categoryId: "burger", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=400&fit=crop", extras: [{ id: "e1", name: "Aci Sos", price: 5 }], variants: [{ id: "v1", name: "Menu", price: 139.99 }], isActive: true, isPopular: false, stock: 80, preparationTime: 8 },
        { id: "pp-4", name: "Patates Kizartmasi", description: "Citir altin sarisi patates", price: 39.99, categoryId: "yan-urunler", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop", extras: [], variants: [{ id: "v1", name: "Buyuk", price: 49.99 }], isActive: true, isPopular: true, stock: 200, preparationTime: 5 },
        { id: "pp-5", name: "Sogan Halkasi", description: "Citir kaplamali sogan halkalari", price: 44.99, categoryId: "yan-urunler", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=400&fit=crop", extras: [], variants: [], isActive: true, isPopular: false, stock: 150, preparationTime: 5 },
        { id: "pp-6", name: "Coca Cola", description: "330ml kutu", price: 24.99, categoryId: "icecekler", image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop", extras: [], variants: [{ id: "v1", name: "500ml", price: 29.99 }], isActive: true, isPopular: true, stock: 300, preparationTime: 1 },
      ],

      /* ── Mock Categories ── */
      categories: [
        { id: "burger", name: "Burgerler", order: 1 },
        { id: "yan-urunler", name: "Yan Urunler", order: 2 },
        { id: "icecekler", name: "Icecekler", order: 3 },
      ],

      /* ── Mock Reviews ── */
      reviews: [
        { id: "r1", customerName: "Ayse T.", rating: 5, comment: "Harika lezzet, cok begendim! Ozellikle Whopper mukemmeldi.", orderId: "po-4", createdAt: h(200) },
        { id: "r2", customerName: "Burak M.", rating: 4, comment: "Teslimat hizliydi, yemekler sicak geldi. Patates biraz az tuzluydu.", reply: "Degerli yorumunuz icin tesekkurler! Tuz konusunda daha dikkatli olacagiz.", orderId: "po-5", createdAt: h(300) },
        { id: "r3", customerName: "Selin K.", rating: 3, comment: "Ortalama bir deneyimdi. Bekledigim kadar iyi degildi.", orderId: "po-5", createdAt: h(500) },
        { id: "r4", customerName: "Emre C.", rating: 5, comment: "Her zamanki gibi mukemmel! Big King favorim.", orderId: "po-4", createdAt: h(700) },
        { id: "r5", customerName: "Deniz A.", rating: 2, comment: "Siparis yanlis geldi, Chicken Royale yerine Whopper gelmis.", orderId: "po-5", createdAt: h(900) },
      ],

      /* ── Actions ── */
      updateOrderStatus: (id, status) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  statusHistory: [
                    ...o.statusHistory,
                    { status, timestamp: new Date().toISOString() },
                  ],
                }
              : o
          ),
        });
      },

      addProduct: (product) => {
        const id = `pp-${Date.now()}`;
        set({ products: [...get().products, { ...product, id }] });
      },

      updateProduct: (id, data) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        });
      },

      removeProduct: (id) => {
        set({ products: get().products.filter((p) => p.id !== id) });
      },

      toggleProductActive: (id) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        });
      },

      addCategory: (name) => {
        const cats = get().categories;
        const id = `cat-${Date.now()}`;
        set({ categories: [...cats, { id, name, order: cats.length + 1 }] });
      },

      removeCategory: (id) => {
        set({ categories: get().categories.filter((c) => c.id !== id) });
      },

      replyReview: (id, reply) => {
        set({
          reviews: get().reviews.map((r) =>
            r.id === id ? { ...r, reply } : r
          ),
        });
      },
    }),
    { name: "neyisek-restaurant-panel" }
  )
);
