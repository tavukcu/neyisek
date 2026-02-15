"use client";

import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.03] to-background">
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              Türkiye genelinde hizmet
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Lezzet kapınıza
              <br />
              <span className="text-primary">gelsin.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Binlerce restorandan istediğiniz yemeği seçin, dakikalar içinde kapınıza teslim edelim. Hızlı, güvenli, lezzetli.
            </p>

            {/* Search Box */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Teslimat adresiniz"
                  className="w-full rounded-xl border bg-card py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <Button size="lg" className="shrink-0 rounded-xl px-6 shadow-sm">
                <Search className="mr-2 h-4 w-4" />
                Restoran Bul
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>2.000+ Restoran</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>81 İlde Hizmet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>Ort. 30dk Teslimat</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main card */}
              <div className="rounded-3xl border bg-card p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">NY</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Sipariş #NY-2026-0842</p>
                    <p className="text-xs text-muted-foreground">Tahmini teslimat: 25 dk</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Sipariş alındı", done: true },
                    { label: "Hazırlanıyor", done: true },
                    { label: "Kurye yolda", done: true },
                    { label: "Teslim edildi", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full border-2 ${
                          step.done
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          step.done ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -left-4 -bottom-4 rounded-2xl border bg-card px-5 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="h-6 w-6 rounded-full bg-primary/20 border-2 border-card" />
                    <div className="h-6 w-6 rounded-full bg-primary/30 border-2 border-card" />
                    <div className="h-6 w-6 rounded-full bg-primary/40 border-2 border-card" />
                  </div>
                  <span className="text-xs font-medium">1.2M+ mutlu müşteri</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
