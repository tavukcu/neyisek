"use client";

import Link from "next/link";
import { ArrowRight, Store, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 md:p-8"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Store className="h-5 w-5 text-primary" strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-bold">Restoraninizi Ekleyin</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Turkiye&apos;nin hizla buyuyen yemek platformuna katilin.
              Binlerce yeni musteriye ulasin.
            </p>
            <Link href="/restaurant-panel">
              <Button variant="outline" className="mt-4 gap-2 rounded-xl">
                Basvuru Yap
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-background border p-6 md:p-8"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Bike className="h-5 w-5 text-amber-600" strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-bold">Kurye Ol</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Kendi programinizi belirleyin, esnek calisma saatleri ile
              rekabetci kazanc elde edin.
            </p>
            <Link href="/courier">
              <Button variant="outline" className="mt-4 gap-2 rounded-xl">
                Basvuru Yap
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
