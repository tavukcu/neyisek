"use client";

import { Truck, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Truck,
    title: "Hizli Teslimat",
    description: "Siparisiniz ortalama 30 dakikada kapinizda. Canli takip ile aninda bilgilenin.",
  },
  {
    icon: ShieldCheck,
    title: "Guvenli Odeme",
    description: "iyzico altyapisi ile PCI-DSS uyumlu, uctan uca sifrelenmis guvenli odeme.",
  },
  {
    icon: MapPin,
    title: "Canli Takip",
    description: "Siparisinizi harita uzerinde anlik takip edin, kuryenin konumunu gorun.",
  },
  {
    icon: Sparkles,
    title: "Akilli Oneriler",
    description: "Yapay zeka destekli kisisellestirilmis yemek ve restoran onerileri.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold md:text-2xl">
            Neden <span className="text-primary">NeYisek</span>?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Yemek siparis deneyimini yeniden tanimlayan teknoloji ve kalite
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-2xl border bg-card p-5 text-center transition-all hover:shadow-sm"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
