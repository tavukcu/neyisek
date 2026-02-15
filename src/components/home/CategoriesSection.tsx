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

const categoryConfig: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  burger: { icon: Beef, bg: "bg-red-50", text: "text-red-500" },
  pizza: { icon: Pizza, bg: "bg-orange-50", text: "text-orange-500" },
  kebap: { icon: UtensilsCrossed, bg: "bg-amber-50", text: "text-amber-600" },
  doner: { icon: Sandwich, bg: "bg-yellow-50", text: "text-yellow-600" },
  pide: { icon: Salad, bg: "bg-lime-50", text: "text-lime-600" },
  tavuk: { icon: Drumstick, bg: "bg-orange-50", text: "text-orange-500" },
  balik: { icon: Fish, bg: "bg-sky-50", text: "text-sky-500" },
  "ev-yemekleri": { icon: Soup, bg: "bg-emerald-50", text: "text-emerald-500" },
  tatli: { icon: CakeSlice, bg: "bg-pink-50", text: "text-pink-500" },
  kahvalti: { icon: Croissant, bg: "bg-amber-50", text: "text-amber-500" },
  icecek: { icon: Coffee, bg: "bg-cyan-50", text: "text-cyan-600" },
  dunya: { icon: Globe, bg: "bg-violet-50", text: "text-violet-500" },
};

export default function CategoriesSection() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Kategoriler</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Aradiginiz lezzeti hizlica bulun
            </p>
          </div>
          <Link
            href="/menu"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Tumunu Gor
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
          {CATEGORIES.map((category, index) => {
            const config = categoryConfig[category.id] || { icon: UtensilsCrossed, bg: "bg-gray-50", text: "text-gray-500" };
            const Icon = config.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Link
                  href={`/menu?category=${category.slug}`}
                  className="group flex flex-col items-center gap-2.5 rounded-2xl border bg-card p-3.5 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.bg} ${config.text} transition-transform group-hover:scale-110`}>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight">
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
