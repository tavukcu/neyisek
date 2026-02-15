export const APP_NAME = "NeYisek";
export const APP_DESCRIPTION =
  "Türkiye'nin en lezzetli yemek sipariş platformu. Binlerce restorandan kapınıza teslimat.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://neyisek.com";

export const CATEGORIES = [
  { id: "burger", name: "Burger", icon: "🍔", slug: "burger" },
  { id: "pizza", name: "Pizza", icon: "🍕", slug: "pizza" },
  { id: "kebap", name: "Kebap", icon: "🥙", slug: "kebap" },
  { id: "doner", name: "Döner", icon: "🌯", slug: "doner" },
  { id: "pide", name: "Pide & Lahmacun", icon: "🫓", slug: "pide" },
  { id: "tavuk", name: "Tavuk", icon: "🍗", slug: "tavuk" },
  { id: "balik", name: "Balık", icon: "🐟", slug: "balik" },
  { id: "ev-yemekleri", name: "Ev Yemekleri", icon: "🍲", slug: "ev-yemekleri" },
  { id: "tatli", name: "Tatlı", icon: "🍰", slug: "tatli" },
  { id: "kahvalti", name: "Kahvaltı", icon: "🥐", slug: "kahvalti" },
  { id: "icecek", name: "İçecek", icon: "🥤", slug: "icecek" },
  { id: "dunya", name: "Dünya Mutfağı", icon: "🌍", slug: "dunya" },
] as const;

export const ORDER_STATUSES = {
  pending: { label: "Onay Bekliyor", color: "warning" },
  confirmed: { label: "Onaylandı", color: "info" },
  preparing: { label: "Hazırlanıyor", color: "info" },
  ready: { label: "Hazır", color: "success" },
  courier_assigned: { label: "Kurye Atandı", color: "info" },
  picked_up: { label: "Yolda", color: "info" },
  delivering: { label: "Teslim Ediliyor", color: "info" },
  delivered: { label: "Teslim Edildi", color: "success" },
  cancelled: { label: "İptal Edildi", color: "destructive" },
} as const;

export const CITIES = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana",
  "Konya", "Gaziantep", "Mersin", "Kayseri", "Eskişehir", "Manisa",
] as const;

export const DELIVERY_FEE_DEFAULT = 15;
export const SERVICE_FEE_RATE = 0.05;
export const MIN_ORDER_AMOUNT = 50;
