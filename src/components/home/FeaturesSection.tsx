"use client";

import { Truck, Shield, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Truck,
    title: "Hızlı Teslimat",
    description: "Siparişiniz ortalama 30 dakikada kapınızda",
  },
  {
    icon: Shield,
    title: "Güvenli Ödeme",
    description: "iyzico altyapısı ile güvenli online ödeme",
  },
  {
    icon: Clock,
    title: "Canlı Takip",
    description: "Siparişinizi anlık harita üzerinde takip edin",
  },
  {
    icon: Sparkles,
    title: "AI Öneri",
    description: "Yapay zeka ile size özel yemek önerileri",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Neden NeYisek?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Yemek sipariş deneyimini yeniden tanımlıyoruz
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group rounded-2xl border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
