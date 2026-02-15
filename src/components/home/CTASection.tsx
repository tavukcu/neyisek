"use client";

import Link from "next/link";
import { ArrowRight, Store, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border bg-card p-8 transition-all hover:shadow-md"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.06]">
              <Store className="h-5 w-5 text-primary" strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-bold">Restoranınızı Ekleyin</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Türkiye&apos;nin hızla büyüyen yemek platformuna katılın.
              Binlerce yeni müşteriye ulaşın, komisyon oranlarımızı inceleyin.
            </p>
            <Link href="/restaurant-panel">
              <Button variant="outline" className="mt-5 gap-2 rounded-xl">
                Başvuru Yap
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="rounded-2xl border bg-card p-8 transition-all hover:shadow-md"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.06]">
              <Bike className="h-5 w-5 text-primary" strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-bold">Kurye Ol</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Kendi programınızı belirleyin, esnek çalışma saatleri ile
              rekabetçi kazanç elde edin. Hemen başvurun.
            </p>
            <Link href="/courier">
              <Button variant="outline" className="mt-5 gap-2 rounded-xl">
                Başvuru Yap
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
