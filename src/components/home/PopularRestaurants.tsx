"use client";

import Link from "next/link";
import { Star, Clock, Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const mockRestaurants = [
  {
    id: "1",
    slug: "burger-king",
    name: "Burger King",
    image: "/placeholder-restaurant.jpg",
    cuisine: ["Burger", "Fast Food"],
    rating: 4.5,
    reviewCount: 320,
    deliveryTime: "25-35",
    deliveryFee: 9.99,
    minOrder: 50,
    isOpen: true,
    discount: "25% İndirim",
  },
  {
    id: "2",
    slug: "pizza-hut",
    name: "Pizza Hut",
    image: "/placeholder-restaurant.jpg",
    cuisine: ["Pizza", "İtalyan"],
    rating: 4.3,
    reviewCount: 210,
    deliveryTime: "30-40",
    deliveryFee: 12.99,
    minOrder: 60,
    isOpen: true,
    discount: null,
  },
  {
    id: "3",
    slug: "kebapci-iskender",
    name: "Kebapçı İskender",
    image: "/placeholder-restaurant.jpg",
    cuisine: ["Kebap", "Türk"],
    rating: 4.8,
    reviewCount: 540,
    deliveryTime: "20-30",
    deliveryFee: 0,
    minOrder: 75,
    isOpen: true,
    discount: "Ücretsiz Teslimat",
  },
  {
    id: "4",
    slug: "pidemiz",
    name: "Pidemiz",
    image: "/placeholder-restaurant.jpg",
    cuisine: ["Pide", "Lahmacun"],
    rating: 4.6,
    reviewCount: 180,
    deliveryTime: "25-35",
    deliveryFee: 7.99,
    minOrder: 40,
    isOpen: true,
    discount: null,
  },
  {
    id: "5",
    slug: "tavukcu-baba",
    name: "Tavukçu Baba",
    image: "/placeholder-restaurant.jpg",
    cuisine: ["Tavuk", "Izgara"],
    rating: 4.4,
    reviewCount: 150,
    deliveryTime: "20-25",
    deliveryFee: 5.99,
    minOrder: 35,
    isOpen: true,
    discount: "15% İndirim",
  },
  {
    id: "6",
    slug: "balik-ekmek",
    name: "Balık Ekmek Evi",
    image: "/placeholder-restaurant.jpg",
    cuisine: ["Balık", "Deniz Ürünleri"],
    rating: 4.7,
    reviewCount: 95,
    deliveryTime: "30-40",
    deliveryFee: 14.99,
    minOrder: 80,
    isOpen: false,
    discount: null,
  },
];

export default function PopularRestaurants() {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">
              Popüler Restoranlar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              En çok tercih edilen restoranlar
            </p>
          </div>
          <Link
            href="/menu"
            className="text-sm font-medium text-primary hover:underline"
          >
            Tümünü Gör
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Link
                href={`/restaurant/${restaurant.slug}`}
                className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground/30">
                    🍽️
                  </div>
                  {!restaurant.isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-background px-4 py-1 text-sm font-medium">
                        Kapalı
                      </span>
                    </div>
                  )}
                  {restaurant.discount && (
                    <Badge className="absolute left-3 top-3 bg-destructive">
                      {restaurant.discount}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {restaurant.cuisine.join(" • ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-xs font-semibold">
                        {restaurant.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({restaurant.reviewCount})
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{restaurant.deliveryTime} dk</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bike className="h-3.5 w-3.5" />
                      <span>
                        {restaurant.deliveryFee === 0
                          ? "Ücretsiz"
                          : `₺${restaurant.deliveryFee}`}
                      </span>
                    </div>
                    <span>Min. ₺{restaurant.minOrder}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
