"use client";

import Link from "next/link";
import { ArrowRight, Store, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-12 md:py-16 bg-primary/5">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Restaurant CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border bg-card p-8 transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Restoranınızı Ekleyin</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Türkiye&apos;nin en büyük yemek platformunda yerinizi alın.
              Binlerce müşteriye ulaşın.
            </p>
            <Link href="/restaurant-panel">
              <Button className="mt-4 gap-2" variant="outline">
                Başvuru Yap
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Courier CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border bg-card p-8 transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Bike className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Kurye Ol</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Kendi programınızı kendiniz belirleyin.
              Esnek çalışma saatleri ve rekabetçi kazanç.
            </p>
            <Link href="/courier">
              <Button className="mt-4 gap-2" variant="outline">
                Başvuru Yap
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
