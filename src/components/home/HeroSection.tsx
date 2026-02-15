"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-10 top-10 text-6xl">🍕</div>
        <div className="absolute right-20 top-20 text-5xl">🍔</div>
        <div className="absolute left-1/3 bottom-10 text-6xl">🥙</div>
        <div className="absolute right-10 bottom-20 text-5xl">🍜</div>
        <div className="absolute left-1/2 top-5 text-4xl">🥐</div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Acıktın mı?{" "}
            <span className="text-primary">Ne Yisek</span> diye düşünme!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Binlerce restorandan sevdiğin yemekleri kapına kadar getiriyoruz.
            Hızlı, güvenli ve lezzetli!
          </p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                type="text"
                placeholder="Adresinizi girin..."
                className="w-full rounded-xl border-2 border-transparent bg-card py-4 pl-12 pr-4 text-base shadow-lg outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ne yemek istersiniz?"
                className="w-full rounded-xl border-2 border-transparent bg-card py-4 pl-12 pr-4 text-base shadow-lg outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <Button size="lg" className="rounded-xl px-8 py-4 text-base h-auto shadow-lg">
              Ara
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">2.000+</p>
              <p>Restoran</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">81 İl</p>
              <p>Türkiye Geneli</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">30 dk</p>
              <p>Ort. Teslimat</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
