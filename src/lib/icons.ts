import {
  Beef,
  Pizza,
  UtensilsCrossed,
  Sandwich,
  Salad,
  Drumstick,
  Fish,
  Soup,
  CakeSlice,
  Croissant,
  Coffee,
  Globe,
  Zap,
  type LucideIcon,
} from "lucide-react";

const cuisineIconMap: Record<string, LucideIcon> = {
  Burger: Beef,
  "Fast Food": Zap,
  Pizza: Pizza,
  "İtalyan": Pizza,
  Makarna: Pizza,
  Kebap: UtensilsCrossed,
  "Türk Mutfağı": UtensilsCrossed,
  Döner: Sandwich,
  Dürüm: Sandwich,
  Pide: Salad,
  Lahmacun: Salad,
  Tavuk: Drumstick,
  Izgara: Drumstick,
  "Balık": Fish,
  "Deniz Ürünleri": Fish,
  "Ev Yemekleri": Soup,
  "Çorba": Soup,
  "Tatlı": CakeSlice,
  "Kahvaltı": Croissant,
  "İçecek": Coffee,
  "Dünya Mutfağı": Globe,
};

const categoryIconMap: Record<string, LucideIcon> = {
  burger: Beef,
  pizza: Pizza,
  kebap: UtensilsCrossed,
  doner: Sandwich,
  pide: Salad,
  tavuk: Drumstick,
  balik: Fish,
  "ev-yemekleri": Soup,
  tatli: CakeSlice,
  kahvalti: Croissant,
  icecek: Coffee,
  icecekler: Coffee,
  "yan-urunler": UtensilsCrossed,
  dunya: Globe,
};

export function getCuisineIcon(cuisine: string): LucideIcon {
  return cuisineIconMap[cuisine] || UtensilsCrossed;
}

export function getCategoryIcon(categoryId: string): LucideIcon {
  return categoryIconMap[categoryId] || UtensilsCrossed;
}
