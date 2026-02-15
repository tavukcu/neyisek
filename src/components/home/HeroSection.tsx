"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/50 to-background">
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              Lezzet kapiiniza
              <br />
              <span className="text-primary">gelsin.</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground md:text-lg">
              Binlerce restorandan istediginiz yemegi secin, dakikalar icinde kapiiniza teslim edelim.
            </p>

            {/* Search */}
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Teslimat adresiniz"
                  className="w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <Button size="lg" className="shrink-0 rounded-xl px-6 shadow-sm">
                <Search className="mr-2 h-4 w-4" />
                Restoran Bul
              </Button>
            </div>

            {/* Trust Badges */}
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
                <span>Ort. 30dk Teslimat</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Food Images Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=375&fit=crop&auto=format"
                    alt="Burger"
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop&auto=format"
                    alt="Pizza"
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                </div>
              </div>
              <div className="space-y-3 pt-6">
                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop&auto=format"
                    alt="Kebap"
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=375&fit=crop&auto=format"
                    alt="Yemek"
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
