"use client";

import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/30 to-background" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-16 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 text-xs font-medium border-primary/20 bg-primary/5 text-primary">
              Turkiye genelinde hizmet
            </Badge>

            <h1 className="text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-[3.25rem]">
              Lezzet kapiniza{" "}
              <span className="text-primary">gelsin.</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
              Binlerce restorandan istediginiz yemegi secin, dakikalar icinde kapiniza teslim edelim.
            </p>

            {/* Search */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Teslimat adresinizi girin"
                  className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <Button size="lg" className="shrink-0 rounded-xl px-6 shadow-md shadow-primary/20">
                <Search className="mr-2 h-4 w-4" />
                Restoran Bul
              </Button>
            </div>

            {/* Quick links */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Populer:</span>
              {["Burger", "Pizza", "Kebap", "Doner"].map((item) => (
                <Link key={item} href={`/menu?category=${item.toLowerCase()}`}>
                  <Badge variant="outline" className="cursor-pointer rounded-full text-xs hover:bg-accent transition-colors">
                    {item}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Trust */}
            <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>2.000+ Restoran</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>81 Ilde Hizmet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>Ort. 30dk</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Food Images */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main large image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-black/10">
                <Image
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&h=525&fit=crop&auto=format"
                  alt="Lezzetli yemekler"
                  fill
                  className="object-cover"
                  sizes="500px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating card - top right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -right-4 top-6 rounded-xl border bg-white p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop&auto=format"
                      alt="Burger"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Whopper Menu</p>
                    <p className="text-[10px] text-green-600 font-medium">Hazirlaniyor...</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card - bottom left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -left-4 bottom-8 rounded-xl border bg-white p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Teslim edildi!</p>
                    <p className="text-[10px] text-muted-foreground">25 dakikada</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
