"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRestaurants,
  getPopularRestaurants,
  searchRestaurants,
} from "@/services/restaurant.service";

export function useRestaurants(options?: {
  cuisine?: string;
  sortBy?: "rating" | "deliveryTime" | "minOrder";
}) {
  return useQuery({
    queryKey: ["restaurants", options?.cuisine, options?.sortBy],
    queryFn: async () => {
      const { restaurants } = await getRestaurants({
        cuisine: options?.cuisine,
        sortBy: options?.sortBy,
        limitCount: 50,
      });
      return restaurants;
    },
  });
}

export function usePopularRestaurants(count = 6) {
  return useQuery({
    queryKey: ["restaurants", "popular", count],
    queryFn: () => getPopularRestaurants(count),
  });
}

export function useSearchRestaurants(term: string) {
  return useQuery({
    queryKey: ["restaurants", "search", term],
    queryFn: () => searchRestaurants(term),
    enabled: term.trim().length > 0,
  });
}
