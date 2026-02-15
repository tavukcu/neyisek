import { Timestamp } from "firebase/firestore";

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
}

export interface ProductExtra {
  id: string;
  name: string;
  price: number;
}

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  images: string[];
  variants: ProductVariant[];
  extras: ProductExtra[];
  nutrition?: Nutrition;
  tags: string[];
  allergens: string[];
  isActive: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  stock: number;
  preparationTime: number;
  rating: { average: number; count: number };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
