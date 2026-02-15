"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Bike, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCuisineIcon } from "@/lib/icons";
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
  const isOpen = true;
  const hasDiscount = restaurant.delivery.fee === 0;
  const CuisineIcon = getCuisineIcon(restaurant.cuisine[0]);
  const hasCover = !!restaurant.images.cover;

  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {hasCover ? (
          <Image
            src={restaurant.images.cover}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-muted">
            <CuisineIcon className="h-12 w-12 text-primary/15" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {hasDiscount && (
            <Badge className="bg-green-500 text-white text-[10px] px-2 py-0.5 border-0 shadow-sm">
              Ucretsiz Teslimat
            </Badge>
          )}
        </div>

        {/* Rating - top right */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-white/95 backdrop-blur-sm px-2 py-1 shadow-sm">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-bold text-gray-800">{restaurant.rating.average}</span>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-white/95 backdrop-blur-sm px-2 py-1 shadow-sm">
            <Clock className="h-3 w-3 text-gray-600" />
            <span className="text-[10px] font-semibold text-gray-700">{restaurant.delivery.estimatedTime} dk</span>
          </div>
        </div>

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(restaurant.id);
            }}
            className="absolute right-3 bottom-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm transition-all hover:bg-white hover:scale-110"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
              )}
            />
          </button>
        )}

        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium">
              Kapali
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] truncate group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {restaurant.cuisine.join(" \u2022 ")}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bike className="h-3.5 w-3.5" />
            <span>
              {restaurant.delivery.fee === 0
                ? "Ucretsiz"
                : `\u20BA${restaurant.delivery.fee.toFixed(2)}`}
            </span>
          </div>
          <span>Min. \u20BA{restaurant.delivery.minOrder}</span>
        </div>
      </div>
    </Link>
  );
}
