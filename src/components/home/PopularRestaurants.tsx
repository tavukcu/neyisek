"use client";

import Link from "next/link";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { mockRestaurants } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function PopularRestaurants() {
  const popular = mockRestaurants.slice(0, 6);

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
          {popular.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
