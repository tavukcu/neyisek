"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <section className="py-4 md:py-6">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/menu"
            className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 p-4 md:p-5 text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold md:text-base">Hos geldin kampanyasi!</p>
                <p className="text-xs text-white/80 md:text-sm">
                  Ilk siparisine ozel %20 indirim + ucretsiz teslimat
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
