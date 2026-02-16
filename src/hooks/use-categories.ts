"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/category.service";
import { CATEGORIES } from "@/lib/constants";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const categories = await getCategories();
      if (categories.length === 0) {
        // Fallback to constants if Firestore is empty
        return CATEGORIES.map((c, i) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          order: i,
          isActive: true,
        }));
      }
      return categories;
    },
    staleTime: 30 * 60 * 1000, // Categories rarely change
  });
}
