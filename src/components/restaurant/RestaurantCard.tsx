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
      className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {hasCover ? (
          <Image
            src={restaurant.images.cover}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-muted">
            <CuisineIcon className="h-12 w-12 text-primary/15" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <span className="rounded-full bg-background px-4 py-1.5 text-sm font-medium">
              Kapali
            </span>
          </div>
        )}
        {hasDiscount && (
          <Badge className="absolute left-3 top-3 z-10 bg-primary text-primary-foreground">
            Ucretsiz Teslimat
          </Badge>
        )}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-black/40 backdrop-blur-sm px-2 py-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-white">{restaurant.rating.average}</span>
        </div>
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(restaurant.id);
            }}
            className="absolute right-3 bottom-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-colors hover:bg-white"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
          {restaurant.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">
          {restaurant.cuisine.join(" \u2022 ")}
        </p>

        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{restaurant.delivery.estimatedTime} dk</span>
          </div>
          <div className="flex items-center gap-1">
            <Bike className="h-3.5 w-3.5" />
            <span>
              {restaurant.delivery.fee === 0
                ? "Ucretsiz"
                : `\u20BA${restaurant.delivery.fee.toFixed(2)}`}
            </span>
          </div>
          <span className="ml-auto text-[11px]">Min. \u20BA{restaurant.delivery.minOrder}</span>
        </div>
      </div>
    </Link>
  );
}
