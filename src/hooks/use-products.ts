"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProductsByRestaurant,
  getPopularProducts,
  getFeaturedProducts,
} from "@/services/product.service";

export function useProducts(restaurantId: string) {
  return useQuery({
    queryKey: ["products", restaurantId],
    queryFn: () => getProductsByRestaurant(restaurantId),
    enabled: !!restaurantId,
  });
}

export function usePopularProducts(restaurantId: string, count = 6) {
  return useQuery({
    queryKey: ["products", restaurantId, "popular", count],
    queryFn: () => getPopularProducts(restaurantId, count),
    enabled: !!restaurantId,
  });
}

export function useFeaturedProducts(restaurantId: string, count = 4) {
  return useQuery({
    queryKey: ["products", restaurantId, "featured", count],
    queryFn: () => getFeaturedProducts(restaurantId, count),
    enabled: !!restaurantId,
  });
}
