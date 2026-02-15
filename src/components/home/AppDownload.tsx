"use client";

import { Smartphone, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function AppDownload() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12 text-white"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

          <div className="relative flex flex-col items-center text-center md:flex-row md:text-left md:justify-between gap-8">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm mb-4">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>App Store&apos;da 4.8 puan</span>
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">
                NeYisek uygulamasini indirin
              </h2>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                Ozel kampanyalar, hizli siparis ve canli takip. Mobil uygulamayla
                yemek siparis deneyimini bir ust seviyeye tasiyin.
              </p>

              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-gray-900 transition-all hover:bg-gray-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] leading-none">Indir</div>
                    <div className="text-sm font-semibold leading-tight">App Store</div>
                  </div>
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-gray-900 transition-all hover:bg-gray-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.394 12l2.304-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] leading-none">Indir</div>
                    <div className="text-sm font-semibold leading-tight">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative flex h-48 w-24 items-center justify-center rounded-3xl border-2 border-white/20 bg-white/5 backdrop-blur-sm md:h-56 md:w-28">
                <Smartphone className="h-8 w-8 text-white/30" />
                <div className="absolute -top-1 left-1/2 h-4 w-10 -translate-x-1/2 rounded-b-xl bg-white/10" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
