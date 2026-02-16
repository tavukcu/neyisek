"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { useFavoriteRestaurants, useFavoriteIds, useToggleFavorite } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const { data: favoriteRestaurants = [], isLoading } = useFavoriteRestaurants();
  const { data: favoriteIds = [] } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const handleToggle = (id: string) => {
    const isFav = favoriteIds.includes(id);
    toggleFavorite.mutate(
      { restaurantId: id, isFavorite: isFav },
      {
        onSuccess: () => {
          toast.success(isFav ? "Favorilerden cikarildi" : "Favorilere eklendi");
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Heart className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Favorilerim</h1>
        <p className="mt-2 text-muted-foreground">
          Favori restoranlarinizi gormek icin giris yapin
        </p>
        <Link href="/login">
          <Button className="mt-6">Giris Yap</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Favorilerim</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? "Yukleniyor..." : `${favoriteRestaurants.length} favori restoran`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : favoriteRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isFavorite={true}
              onToggleFavorite={handleToggle}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">Henuz favoriniz yok</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Begendginiz restoranlari kalp ikonuna tiklayarak favori listenize
            ekleyin
          </p>
          <Link href="/menu">
            <Button variant="outline" className="mt-4">
              Restoranlari Kesfet
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
