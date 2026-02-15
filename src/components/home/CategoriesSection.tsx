"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";

export default function CategoriesSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Kategoriler</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ne canın çekiyorsa hemen bul
            </p>
          </div>
          <Link
            href="/menu"
            className="text-sm font-medium text-primary hover:underline"
          >
            Tümünü Gör
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={`/menu?category=${category.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="text-4xl transition-transform group-hover:scale-110">
                  {category.icon}
                </span>
                <span className="text-xs font-medium text-center sm:text-sm">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
