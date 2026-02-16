import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ── Types ── */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "restaurant" | "courier" | "admin";
  status: "active" | "suspended" | "banned";
  createdAt: string;
  ordersCount: number;
}

export interface AdminRestaurant {
  id: string;
  name: string;
  owner: string;
  city: string;
  district: string;
  cuisine: string[];
  status: "pending" | "active" | "suspended" | "closed";
  rating: number;
  ordersCount: number;
  commission: number;
  createdAt: string;
}

export interface AdminCourier {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  zone: string;
  status: "available" | "busy" | "offline" | "suspended";
  deliveries: number;
  rating: number;
  earnings: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  restaurant: string;
  total: number;
  status: string;
  payment: string;
  createdAt: string;
}

export interface AdminCampaign {
  id: string;
  title: string;
  code: string;
  type: "percentage" | "fixed" | "free_delivery";
  value: number;
  minOrder: number;
  usageCount: number;
  usageLimit: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  restaurantCount: number;
}

/* ── Store ── */
interface AdminState {
  users: AdminUser[];
  restaurants: AdminRestaurant[];
  couriers: AdminCourier[];
  orders: AdminOrder[];
  campaigns: AdminCampaign[];
  categories: AdminCategory[];

  updateUserStatus: (id: string, status: AdminUser["status"]) => void;
  updateRestaurantStatus: (id: string, status: AdminRestaurant["status"]) => void;
  updateCourierStatus: (id: string, status: AdminCourier["status"]) => void;
  toggleCampaign: (id: string) => void;
  addCampaign: (c: Omit<AdminCampaign, "id" | "usageCount">) => void;
  removeCampaign: (id: string) => void;
  addCategory: (name: string, slug: string) => void;
  removeCategory: (id: string) => void;
  toggleCategory: (id: string) => void;
}

const h = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      users: [
        { id: "u1", name: "Ahmet Yilmaz", email: "ahmet@email.com", phone: "0532 111 22 33", role: "customer", status: "active", createdAt: h(30), ordersCount: 15 },
        { id: "u2", name: "Zeynep Kaya", email: "zeynep@email.com", phone: "0544 222 33 44", role: "customer", status: "active", createdAt: h(25), ordersCount: 8 },
        { id: "u3", name: "Mehmet Aksoy", email: "mehmet@email.com", phone: "0555 333 44 55", role: "customer", status: "suspended", createdAt: h(60), ordersCount: 3 },
        { id: "u4", name: "Fatma Demir", email: "fatma@email.com", phone: "0533 444 55 66", role: "restaurant", status: "active", createdAt: h(90), ordersCount: 0 },
        { id: "u5", name: "Ali Yilmaz", email: "ali@email.com", phone: "0532 555 66 77", role: "courier", status: "active", createdAt: h(45), ordersCount: 0 },
        { id: "u6", name: "Selin Ozturk", email: "selin@email.com", phone: "0542 666 77 88", role: "customer", status: "active", createdAt: h(10), ordersCount: 22 },
        { id: "u7", name: "Burak Can", email: "burak@email.com", phone: "0555 777 88 99", role: "customer", status: "banned", createdAt: h(120), ordersCount: 1 },
        { id: "u8", name: "Deniz Arslan", email: "deniz@email.com", phone: "0544 888 99 00", role: "admin", status: "active", createdAt: h(180), ordersCount: 0 },
      ],

      restaurants: [
        { id: "r1", name: "Burger King", owner: "Fatma Demir", city: "Istanbul", district: "Kadikoy", cuisine: ["Burger", "Fast Food"], status: "active", rating: 4.5, ordersCount: 320, commission: 15, createdAt: h(90) },
        { id: "r2", name: "Pizza Lazza", owner: "Hasan Celik", city: "Istanbul", district: "Beyoglu", cuisine: ["Pizza", "Italyan"], status: "active", rating: 4.3, ordersCount: 210, commission: 12, createdAt: h(80) },
        { id: "r3", name: "Kebapci Iskender", owner: "Ismail Usta", city: "Bursa", district: "Osmangazi", cuisine: ["Kebap"], status: "active", rating: 4.8, ordersCount: 540, commission: 10, createdAt: h(120) },
        { id: "r4", name: "Yeni Lezzet Cafe", owner: "Ayse Yildiz", city: "Ankara", district: "Cankaya", cuisine: ["Ev Yemekleri"], status: "pending", rating: 0, ordersCount: 0, commission: 12, createdAt: h(2) },
        { id: "r5", name: "Taze Balik", owner: "Kemal Deniz", city: "Istanbul", district: "Besiktas", cuisine: ["Balik"], status: "pending", rating: 0, ordersCount: 0, commission: 10, createdAt: h(1) },
        { id: "r6", name: "Donerci Sahin", owner: "Sahin Koc", city: "Istanbul", district: "Uskudar", cuisine: ["Doner"], status: "suspended", rating: 3.2, ordersCount: 45, commission: 12, createdAt: h(60) },
      ],

      couriers: [
        { id: "c1", name: "Ali Yilmaz", phone: "0532 555 66 77", vehicle: "Motorsiklet", zone: "Kadikoy", status: "available", deliveries: 187, rating: 4.8, earnings: 4250 },
        { id: "c2", name: "Emre Kara", phone: "0544 111 22 33", vehicle: "Bisiklet", zone: "Besiktas", status: "busy", deliveries: 95, rating: 4.6, earnings: 2100 },
        { id: "c3", name: "Cem Ozdemir", phone: "0555 222 33 44", vehicle: "Motorsiklet", zone: "Beyoglu", status: "offline", deliveries: 312, rating: 4.9, earnings: 7800 },
        { id: "c4", name: "Serkan Aydin", phone: "0533 333 44 55", vehicle: "Otomobil", zone: "Uskudar", status: "available", deliveries: 150, rating: 4.4, earnings: 3600 },
        { id: "c5", name: "Murat Yildiz", phone: "0542 444 55 66", vehicle: "Motorsiklet", zone: "Fatih", status: "suspended", deliveries: 20, rating: 3.1, earnings: 450 },
      ],

      orders: [
        { id: "o1", orderNumber: "NY-2026-0850", customer: "Ahmet Y.", restaurant: "Burger King", total: 429.95, status: "preparing", payment: "credit_card", createdAt: h(0) },
        { id: "o2", orderNumber: "NY-2026-0849", customer: "Zeynep K.", restaurant: "Pizza Lazza", total: 198.97, status: "confirmed", payment: "cash", createdAt: h(0) },
        { id: "o3", orderNumber: "NY-2026-0848", customer: "Mehmet A.", restaurant: "Burger King", total: 372.21, status: "pending", payment: "credit_card", createdAt: h(0) },
        { id: "o4", orderNumber: "NY-2026-0845", customer: "Elif S.", restaurant: "Kebapci Iskender", total: 219.96, status: "delivered", payment: "credit_card", createdAt: h(1) },
        { id: "o5", orderNumber: "NY-2026-0842", customer: "Can D.", restaurant: "Pidecim", total: 335.47, status: "delivered", payment: "credit_card", createdAt: h(1) },
        { id: "o6", orderNumber: "NY-2026-0838", customer: "Selin O.", restaurant: "Burger King", total: 159.99, status: "delivered", payment: "cash", createdAt: h(2) },
        { id: "o7", orderNumber: "NY-2026-0835", customer: "Mert B.", restaurant: "Donerci Sahin", total: 189.98, status: "cancelled", payment: "credit_card", createdAt: h(2) },
      ],

      campaigns: [
        { id: "cm1", title: "Hos Geldin Kampanyasi", code: "HOSGELDIN20", type: "percentage", value: 20, minOrder: 100, usageCount: 342, usageLimit: 1000, isActive: true, startDate: h(30), endDate: new Date(Date.now() + 30 * 86400000).toISOString() },
        { id: "cm2", title: "Ucretsiz Teslimat", code: "FREESHIP", type: "free_delivery", value: 0, minOrder: 150, usageCount: 128, usageLimit: 500, isActive: true, startDate: h(15), endDate: new Date(Date.now() + 15 * 86400000).toISOString() },
        { id: "cm3", title: "50 TL Indirim", code: "SUPER50", type: "fixed", value: 50, minOrder: 200, usageCount: 89, usageLimit: 200, isActive: false, startDate: h(60), endDate: h(10) },
      ],

      categories: [
        { id: "burger", name: "Burger", slug: "burger", order: 1, isActive: true, restaurantCount: 45 },
        { id: "pizza", name: "Pizza", slug: "pizza", order: 2, isActive: true, restaurantCount: 38 },
        { id: "kebap", name: "Kebap", slug: "kebap", order: 3, isActive: true, restaurantCount: 62 },
        { id: "doner", name: "Doner", slug: "doner", order: 4, isActive: true, restaurantCount: 55 },
        { id: "pide", name: "Pide & Lahmacun", slug: "pide", order: 5, isActive: true, restaurantCount: 41 },
        { id: "tavuk", name: "Tavuk", slug: "tavuk", order: 6, isActive: true, restaurantCount: 30 },
        { id: "balik", name: "Balik", slug: "balik", order: 7, isActive: true, restaurantCount: 18 },
        { id: "ev-yemekleri", name: "Ev Yemekleri", slug: "ev-yemekleri", order: 8, isActive: true, restaurantCount: 52 },
        { id: "tatli", name: "Tatli", slug: "tatli", order: 9, isActive: true, restaurantCount: 25 },
        { id: "kahvalti", name: "Kahvalti", slug: "kahvalti", order: 10, isActive: true, restaurantCount: 33 },
        { id: "icecek", name: "Icecek", slug: "icecek", order: 11, isActive: true, restaurantCount: 20 },
        { id: "dunya", name: "Dunya Mutfagi", slug: "dunya", order: 12, isActive: true, restaurantCount: 15 },
      ],

      updateUserStatus: (id, status) => set({ users: get().users.map((u) => u.id === id ? { ...u, status } : u) }),
      updateRestaurantStatus: (id, status) => set({ restaurants: get().restaurants.map((r) => r.id === id ? { ...r, status } : r) }),
      updateCourierStatus: (id, status) => set({ couriers: get().couriers.map((c) => c.id === id ? { ...c, status } : c) }),
      toggleCampaign: (id) => set({ campaigns: get().campaigns.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c) }),
      addCampaign: (c) => set({ campaigns: [...get().campaigns, { ...c, id: `cm-${Date.now()}`, usageCount: 0 }] }),
      removeCampaign: (id) => set({ campaigns: get().campaigns.filter((c) => c.id !== id) }),
      addCategory: (name, slug) => {
        const cats = get().categories;
        set({ categories: [...cats, { id: `cat-${Date.now()}`, name, slug, order: cats.length + 1, isActive: true, restaurantCount: 0 }] });
      },
      removeCategory: (id) => set({ categories: get().categories.filter((c) => c.id !== id) }),
      toggleCategory: (id) => set({ categories: get().categories.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c) }),
    }),
    { name: "neyisek-admin" }
  )
);
