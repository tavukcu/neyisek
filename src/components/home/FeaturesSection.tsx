"use client";

import { Truck, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Truck,
    title: "Hızlı Teslimat",
    description: "Siparişiniz ortalama 30 dakikada kapınızda. Canlı takip ile anında bilgilenin.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli Ödeme",
    description: "iyzico altyapısı ile PCI-DSS uyumlu, uçtan uca şifrelenmiş güvenli ödeme.",
  },
  {
    icon: MapPin,
    title: "Canlı Takip",
    description: "Siparişinizi harita üzerinde anlık takip edin, kuryenin konumunu görün.",
  },
  {
    icon: Sparkles,
    title: "Akıllı Öneriler",
    description: "Yapay zeka destekli kişiselleştirilmiş yemek ve restoran önerileri.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Neden <span className="text-primary">NeYisek</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground md:text-base">
            Yemek sipariş deneyimini yeniden tanımlayan teknoloji ve kalite
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.06] text-primary transition-colors group-hover:bg-primary/10">
                <feature.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
