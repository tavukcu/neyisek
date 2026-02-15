"use client";

import Link from "next/link";
import {
  Beef,
  Pizza,
  Drumstick,
  Fish,
  Croissant,
  Coffee,
  CakeSlice,
  Salad,
  Sandwich,
  Soup,
  Globe,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";

const categoryIcons: Record<string, React.ElementType> = {
  burger: Beef,
  pizza: Pizza,
  kebap: UtensilsCrossed,
  doner: Sandwich,
  pide: Salad,
  tavuk: Drumstick,
  balik: Fish,
  "ev-yemekleri": Soup,
  tatli: CakeSlice,
  kahvalti: Croissant,
  icecek: Coffee,
  dunya: Globe,
};

export default function CategoriesSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Kategoriler
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Aradığınız lezzeti hızlıca bulun
            </p>
          </div>
          <Link
            href="/menu"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Tümünü Gör
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {CATEGORIES.map((category, index) => {
            const Icon = categoryIcons[category.id] || UtensilsCrossed;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <Link
                  href={`/menu?category=${category.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.06] text-primary transition-colors group-hover:bg-primary/10">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {category.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
