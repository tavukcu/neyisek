"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { mockRestaurants } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function PopularRestaurants() {
  const popular = mockRestaurants.slice(0, 6);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">
              Populer Restoranlar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              En cok tercih edilen restoranlar
            </p>
          </div>
          <Link
            href="/menu"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Tumunu Gor
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </div>

        <Link
          href="/menu"
          className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline sm:hidden"
        >
          Tumunu Gor
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
