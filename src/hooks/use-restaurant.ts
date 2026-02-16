"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRestaurantBySlug,
  getRestaurantById,
} from "@/services/restaurant.service";

export function useRestaurantBySlug(slug: string) {
  return useQuery({
    queryKey: ["restaurant", "slug", slug],
    queryFn: () => getRestaurantBySlug(slug),
    enabled: !!slug,
  });
}

export function useRestaurantById(id: string) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurantById(id),
    enabled: !!id,
  });
}
