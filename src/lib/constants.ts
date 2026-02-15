export const APP_NAME = "NeYisek";
export const APP_DESCRIPTION =
  "Türkiye'nin en lezzetli yemek sipariş platformu. Binlerce restorandan kapınıza teslimat.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://neyisek.com";

export const CATEGORIES = [
  { id: "burger", name: "Burger", slug: "burger" },
  { id: "pizza", name: "Pizza", slug: "pizza" },
  { id: "kebap", name: "Kebap", slug: "kebap" },
  { id: "doner", name: "Döner", slug: "doner" },
  { id: "pide", name: "Pide & Lahmacun", slug: "pide" },
  { id: "tavuk", name: "Tavuk", slug: "tavuk" },
  { id: "balik", name: "Balık", slug: "balik" },
  { id: "ev-yemekleri", name: "Ev Yemekleri", slug: "ev-yemekleri" },
  { id: "tatli", name: "Tatlı", slug: "tatli" },
  { id: "kahvalti", name: "Kahvaltı", slug: "kahvalti" },
  { id: "icecek", name: "İçecek", slug: "icecek" },
  { id: "dunya", name: "Dünya Mutfağı", slug: "dunya" },
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
