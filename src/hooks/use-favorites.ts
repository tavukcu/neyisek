"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favorites.service";
import { getRestaurantsByIds } from "@/services/restaurant.service";
import { useAuth } from "@/hooks/use-auth";
import type { Restaurant } from "@/types";

export function useFavoriteIds() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => getFavorites(userId!),
    enabled: !!userId,
  });
}

export function useFavoriteRestaurants() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<Restaurant[]>({
    queryKey: ["favorites", userId, "restaurants"],
    queryFn: async () => {
      if (!userId) return [];
      const ids = await getFavorites(userId);
      if (ids.length === 0) return [];
      return getRestaurantsByIds(ids);
    },
    enabled: !!userId,
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  return useMutation({
    mutationFn: async ({
      restaurantId,
      isFavorite,
    }: {
      restaurantId: string;
      isFavorite: boolean;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      if (isFavorite) {
        await removeFavorite(userId, restaurantId);
      } else {
        await addFavorite(userId, restaurantId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });
}
