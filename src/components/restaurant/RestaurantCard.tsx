"use client";

import Link from "next/link";
import { Star, Clock, Bike, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/types";

interface RestaurantCardProps {
  restaurant: Restaurant & { id: string };
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
}: RestaurantCardProps) {
  const isOpen = true; // TODO: calculate from hours
  const hasDiscount = restaurant.delivery.fee === 0;

  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-5xl text-muted-foreground/20 transition-transform group-hover:scale-110">
          {restaurant.cuisine[0] === "Burger"
            ? "🍔"
            : restaurant.cuisine[0] === "Pizza"
              ? "🍕"
              : restaurant.cuisine[0] === "Kebap"
                ? "🥙"
                : restaurant.cuisine[0] === "Pide"
                  ? "🫓"
                  : restaurant.cuisine[0] === "Tavuk"
                    ? "🍗"
                    : restaurant.cuisine[0] === "Balık"
                      ? "🐟"
                      : restaurant.cuisine[0] === "Döner"
                        ? "🌯"
                        : restaurant.cuisine[0] === "Ev Yemekleri"
                          ? "🍲"
                          : "🍽️"}
        </div>
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <span className="rounded-full bg-background px-4 py-1.5 text-sm font-medium">
              Kapalı
            </span>
          </div>
        )}
        {hasDiscount && (
          <Badge className="absolute left-3 top-3 z-10 bg-primary">
            Ücretsiz Teslimat
          </Badge>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(restaurant.id);
            }}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {restaurant.cuisine.join(" • ")}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 rounded-lg bg-primary/10 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-xs font-semibold">{restaurant.rating.average}</span>
            <span className="text-[10px] text-muted-foreground">
              ({restaurant.rating.count})
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{restaurant.delivery.estimatedTime} dk</span>
          </div>
          <div className="flex items-center gap-1">
            <Bike className="h-3.5 w-3.5" />
            <span>
              {restaurant.delivery.fee === 0
                ? "Ücretsiz"
                : `₺${restaurant.delivery.fee.toFixed(2)}`}
            </span>
          </div>
          <span>Min. ₺{restaurant.delivery.minOrder}</span>
        </div>
      </div>
    </Link>
  );
}
