"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { mockRestaurants } from "@/lib/mock-data";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuthStore();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["1", "3", "7"]);

  const favoriteRestaurants = mockRestaurants.filter((r) =>
    favoriteIds.includes(r.id)
  );

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        toast.success("Favorilerden çıkarıldı");
        return prev.filter((fid) => fid !== id);
      } else {
        toast.success("Favorilere eklendi");
        return [...prev, id];
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Heart className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Favorilerim</h1>
        <p className="mt-2 text-muted-foreground">
          Favori restoranlarınızı görmek için giriş yapın
        </p>
        <Link href="/login">
          <Button className="mt-6">Giriş Yap</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Favorilerim</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {favoriteRestaurants.length} favori restoran
        </p>
      </div>

      {favoriteRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">Henüz favoriniz yok</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Beğendiğiniz restoranları kalp ikonuna tıklayarak favori listenize
            ekleyin
          </p>
          <Link href="/menu">
            <Button variant="outline" className="mt-4">
              Restoranları Keşfet
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
